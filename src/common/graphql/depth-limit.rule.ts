import {
  GraphQLError,
  ValidationContext,
  ASTVisitor,
  FragmentDefinitionNode,
  SelectionSetNode,
  FieldNode,
  InlineFragmentNode,
  FragmentSpreadNode,
  OperationDefinitionNode,
} from 'graphql';

/**
 * A public GraphQL endpoint accepts arbitrary queries, so depth is checked
 * during validation — before a single row is read.
 *
 * Today this schema is acyclic and only four levels deep
 * (profile → experiences → achievements → scalar), so the default limit of 8
 * never fires. The rule is here for the schema this one will become: the first
 * back-reference (Experience.profile, say) makes unbounded nesting possible,
 * and by then the guard should already exist rather than be written under
 * pressure. Set MAX_QUERY_DEPTH to 3 to see it reject the deepest query the
 * current schema allows.
 *
 * Written by hand rather than pulled from a package: it is ~60 lines, and the
 * popular library for this has been unmaintained for years.
 */
export function depthLimit(maxDepth: number) {
  return (context: ValidationContext): ASTVisitor => {
    const fragments = new Map<string, FragmentDefinitionNode>();

    for (const definition of context.getDocument().definitions) {
      if (definition.kind === 'FragmentDefinition') {
        fragments.set(definition.name.value, definition);
      }
    }

    /**
     * Depth a fragment adds, measured once and reused.
     *
     * This memoisation is the whole reason the rule is safe to run on a public
     * endpoint. A fragment's contribution does not depend on where it is
     * spread, so it can be computed a single time. Expanding every spread
     * separately — the obvious implementation — costs O(2^n) on a document
     * where each fragment spreads the next one twice: perfectly valid, no
     * cycles, about a kilobyte, and it pins the event loop for the better part
     * of a minute. That turns the guard itself into the cheapest denial of
     * service against the service it protects.
     */
    const fragmentDepth = new Map<string, number>();
    const resolving = new Set<string>();

    const depthOfFragment = (name: string): number => {
      const cached = fragmentDepth.get(name);
      if (cached !== undefined) {
        return cached;
      }
      const fragment = fragments.get(name);
      // An unknown fragment is KnownFragmentNamesRule's job; a cycle is
      // NoFragmentCyclesRule's. Either way the document is rejected elsewhere,
      // so contributing zero here is safe and keeps this rule terminating.
      if (!fragment || resolving.has(name)) {
        return 0;
      }
      resolving.add(name);
      const depth = measure(fragment.selectionSet, 0);
      resolving.delete(name);
      // A depth measured while breaking a cycle is not the real one, so it is
      // deliberately not cached.
      if (!resolving.has(name)) {
        fragmentDepth.set(name, depth);
      }
      return depth;
    };

    const measure = (selectionSet: SelectionSetNode | undefined, depth: number): number => {
      if (!selectionSet) {
        return depth;
      }
      let deepest = depth;

      for (const selection of selectionSet.selections) {
        if (selection.kind === 'Field') {
          const field = selection as FieldNode;
          // Introspection and __typename never count towards user depth.
          if (field.name.value.startsWith('__')) {
            continue;
          }
          deepest = Math.max(deepest, measure(field.selectionSet, depth + 1));
        } else if (selection.kind === 'InlineFragment') {
          const inline = selection as InlineFragmentNode;
          deepest = Math.max(deepest, measure(inline.selectionSet, depth));
        } else {
          const spread = selection as FragmentSpreadNode;
          deepest = Math.max(deepest, depth + depthOfFragment(spread.name.value));
        }
      }
      return deepest;
    };

    return {
      OperationDefinition(node: OperationDefinitionNode) {
        const depth = measure(node.selectionSet, 0);
        if (depth > maxDepth) {
          context.reportError(
            new GraphQLError(
              `Query is too deep: ${depth} levels, the maximum is ${maxDepth}.`,
              { nodes: [node] },
            ),
          );
        }
      },
    };
  };
}
