import { describe, expect, it } from 'vitest';

interface PublicMediaBudgetModule {
  classifyPublicTourMediaPath: (filePath: string) => string;
}

const importPublicMediaBudgetModule = async (): Promise<PublicMediaBudgetModule> =>
  // @ts-expect-error Vitest can import local .mjs script modules; TypeScript has no declaration for this test-only import.
  import('../../scripts/public-media-budget-core.mjs') as Promise<PublicMediaBudgetModule>;

describe('public media budget classifier', () => {
  it('classifies grid WebM, legacy plain WebM, and viewer MP4', async () => {
    const { classifyPublicTourMediaPath } = await importPublicMediaBudgetModule();

    expect(classifyPublicTourMediaPath('public/tours/spring/spring-3.grid.webm')).toBe('gridVideo');
    expect(classifyPublicTourMediaPath('public/tours/spring/spring-11.webm')).toBe('other');
    expect(classifyPublicTourMediaPath('public/tours/spring/spring-11/source.mp4')).toBe('viewerVideo');
  });

  it('classifies poster and hero or viewer images', async () => {
    const { classifyPublicTourMediaPath } = await importPublicMediaBudgetModule();

    expect(classifyPublicTourMediaPath('public/tours/spring/spring-3.poster.mobile.webp')).toBe('posterImage');
    expect(classifyPublicTourMediaPath('public/tours/spring-3/hero.mobile.webp')).toBe('coverMobile');
    expect(classifyPublicTourMediaPath('public/tours/spring/spring-11.webp')).toBe('heroOrViewerImage');
  });
});
