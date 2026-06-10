import { setupOgShellBuildEnv } from './lib/ogShellEnv.ts';

setupOgShellBuildEnv();

const { TOURS } = await import('../src/data/toursData.ts');
const { validateTourSlugs } = await import('../src/constants/tourUrls.ts');

try {
  validateTourSlugs(TOURS);
  process.stdout.write(`Tour slug validation passed (${TOURS.length} tours).\n`);
} catch (error) {
  process.stderr.write(
    `validate-tour-slugs failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
