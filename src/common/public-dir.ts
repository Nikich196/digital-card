import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Absolute path to public/.
 *
 * Resolved by looking rather than by assuming: the compiled entry point sits at
 * dist/src/main.js when the container runs it and at dist/main.js under some
 * build layouts, so a fixed number of '..' hops is wrong in one of the two.
 */
function resolvePublicDir(): string {
  const candidates = [
    join(__dirname, '..', '..', '..', 'public'), // dist/src/common → project root
    join(__dirname, '..', '..', 'public'), // dist/common → project root
    join(process.cwd(), 'public'),
  ];
  return candidates.find((path) => existsSync(path)) ?? join(process.cwd(), 'public');
}

export const PUBLIC_DIR = resolvePublicDir();
