import { setupOgShellBuildEnv } from './lib/ogShellEnv.ts';
import { TOURS } from '../src/data/toursData.ts';
import { validateTourSlugs } from '../src/constants/tourUrls.ts';

setupOgShellBuildEnv();

try {
  validateTourSlugs(TOURS);
  process.stdout.write(`Tour slug validation passed (${TOURS.length} tours).\n`);
} catch (error) {
  process.stderr.write(
    `validate-tour-slugs failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
