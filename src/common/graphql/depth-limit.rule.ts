import { GraphQLError, ValidationContext, ASTVisitor, FragmentDefinitionNode, SelectionSetNode, FieldNode, InlineFragmentNode, FragmentSpreadNode, OperationDefinitionNode } from 'graphql';

/**
 * A public GraphQL endpoint accepts arbitrary queries, and this schema is
 * cyclic-friendly enough that a client can nest selections far deeper than any
 * legitimate use. Depth is the cheapest effective guard: it rejects the query
 * during validation, before a single row is read.
 *
 * Written by hand rather than pulled from a package: it is ~40 lines, and the
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

    /** Fragment spreads are expanded, so a fragment cannot smuggle depth in. */
    const measure = (
      selectionSet: SelectionSetNode | undefined,
      depth: number,
      visitedFragments: Set<string>,
    ): number => {
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
          deepest = Math.max(deepest, measure(field.selectionSet, depth + 1, visitedFragments));
        } else if (selection.kind === 'InlineFragment') {
          const inline = selection as InlineFragmentNode;
          deepest = Math.max(deepest, measure(inline.selectionSet, depth, visitedFragments));
        } else {
          const spread = selection as FragmentSpreadNode;
          const name = spread.name.value;
          // Guard against recursive fragments, which would loop forever.
          if (visitedFragments.has(name)) {
            continue;
          }
          const fragment = fragments.get(name);
          if (fragment) {
            deepest = Math.max(
              deepest,
              measure(fragment.selectionSet, depth, new Set(visitedFragments).add(name)),
            );
          }
        }
      }
      return deepest;
    };

    return {
      OperationDefinition(node: OperationDefinitionNode) {
        const depth = measure(node.selectionSet, 0, new Set());
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
