import { setupOgShellBuildEnv } from './lib/ogShellEnv.ts';

setupOgShellBuildEnv();

const { TOURS } = await import('../src/data/toursData.ts');
const { TOUR_SLUG_BY_ID } = await import('../src/data/tourSlugs.ts');
const { validateTourSlugs } = await import('../src/constants/tourUrls.ts');

try {
  const missingSlugs = TOURS.filter((tour) => TOUR_SLUG_BY_ID[tour.id as keyof typeof TOUR_SLUG_BY_ID] == null);
  if (missingSlugs.length > 0) {
    throw new Error(
      `Missing slugs for: ${missingSlugs.map((tour) => tour.id).join(', ')}`,
    );
  }
  validateTourSlugs(TOURS);
  process.stdout.write(`Tour slug validation passed (${TOURS.length} tours).\n`);
} catch (error) {
  process.stderr.write(
    `validate-tour-slugs failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
