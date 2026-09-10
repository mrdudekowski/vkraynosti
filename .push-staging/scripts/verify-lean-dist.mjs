import { resolve } from 'node:path';
import { verifyLeanDistTours } from './lib/verifyLeanDist.mjs';

const distDir = resolve(process.cwd(), 'dist');
const { ok, violations } = verifyLeanDistTours(distDir);

if (!ok) {
  process.stderr.write(
    `verify-lean-dist failed: tour media found in dist/tours:\n${violations.join('\n')}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write('Lean dist tours OK (no media under dist/tours)\n');
}
