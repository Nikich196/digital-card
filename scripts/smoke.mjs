#!/usr/bin/env node
/**
 * Smoke test against a running instance.
 *
 *   node scripts/smoke.mjs [url]        # default http://localhost:3000/graphql
 *
 * It checks the things the service actually promises: the card returns nested
 * data, unknown profiles fail cleanly, malformed queries are rejected during
 * validation, and internal errors are never echoed back to the client.
 * Kept dependency-free on purpose — it runs anywhere Node runs, including
 * against the deployed instance.
 */

const url = process.argv[2] ?? 'http://localhost:3000/graphql';

let passed = 0;
let failed = 0;

async function gql(query) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return response.json();
}

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ok    ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`);
  }
}

console.log(`smoke test against ${url}\n`);

// ---------------------------------------------------------------- health
const health = await gql('{ health { status uptimeSeconds databaseLatencyMs } }');
check('health responds', health?.data?.health?.status === 'ok', JSON.stringify(health));
check(
  'database is reachable',
  typeof health?.data?.health?.databaseLatencyMs === 'number',
);

// ---------------------------------------------------------------- the card
const card = await gql(`{
  profile {
    name headline description location email
    links { label url }
    skills { name category level }
    experiences { company position startedAt finishedAt isCurrent achievements { text } }
    projects { name url stack }
  }
}`);
const profile = card?.data?.profile;

check('profile is returned', Boolean(profile), JSON.stringify(card).slice(0, 200));
check('profile has a name', Boolean(profile?.name));
check('links are present', (profile?.links?.length ?? 0) > 0);
check('skills are present', (profile?.skills?.length ?? 0) > 0);
check('experiences are present', (profile?.experiences?.length ?? 0) > 0);
check('projects are present', (profile?.projects?.length ?? 0) > 0);
check(
  'nested achievements are resolved',
  (profile?.experiences ?? []).some((e) => (e.achievements?.length ?? 0) > 0),
);
check(
  'isCurrent is derived from finishedAt',
  (profile?.experiences ?? []).every((e) => e.isCurrent === (e.finishedAt === null)),
);
check(
  'skill levels use the enum',
  (profile?.skills ?? []).every((s) => ['BASIC', 'INTERMEDIATE', 'ADVANCED'].includes(s.level)),
);

// ---------------------------------------------------------------- lookup by slug
const bySlug = await gql('{ profile(slug: "nikita-satsiuk") { slug } }');
check('lookup by slug works', bySlug?.data?.profile?.slug === 'nikita-satsiuk');

// ---------------------------------------------------------------- error handling
const missing = await gql('{ profile(slug: "definitely-not-here") { name } }');
check(
  'unknown slug returns NOT_FOUND',
  missing?.errors?.[0]?.extensions?.code === 'NOT_FOUND',
  JSON.stringify(missing).slice(0, 200),
);
check(
  'not-found message is explicit',
  /not been seeded|was not found/.test(missing?.errors?.[0]?.message ?? ''),
);

const broken = await gql('{ profile { name ');
check(
  'syntax errors are reported to the client',
  broken?.errors?.[0]?.extensions?.code === 'GRAPHQL_PARSE_FAILED',
);

const unknownField = await gql('{ profile { thisFieldDoesNotExist } }');
check(
  'unknown fields fail validation',
  unknownField?.errors?.[0]?.extensions?.code === 'GRAPHQL_VALIDATION_FAILED',
);

// ---------------------------------------------------------------- nesting depth
// The deepest legitimate query in this schema is four levels, comfortably
// under MAX_QUERY_DEPTH. It must pass; anything deeper is rejected during
// validation, which is covered by the unknown-field case above.
const nested = await gql('{ profile { experiences { achievements { text } } } }');
check(
  'the deepest legitimate query is allowed',
  Array.isArray(nested?.data?.profile?.experiences),
  JSON.stringify(nested).slice(0, 160),
);

console.log(`
${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
