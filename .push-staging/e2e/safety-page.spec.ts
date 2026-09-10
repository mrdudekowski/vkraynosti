import { expect, test } from '@playwright/test';
import { UI } from '../src/constants/ui';

test.describe('Safety page hero', () => {
  test('desktop: фон hero отображается (img с ненулевой высотой)', async ({ page }) => {
    await page.setViewportSize({ width: 1160, height: 900 });
    await page.goto('./safety', { waitUntil: 'domcontentloaded' });

    const heroImage = page.locator(`img[alt="${UI.safetyPage.heroImageAlt}"]`);
    await expect(heroImage).toHaveCount(1, { timeout: 15_000 });

    await expect
      .poll(async () =>
        heroImage.evaluate((img) => {
          const rect = img.getBoundingClientRect();
          return rect.height > 0 && img.naturalWidth > 0;
        })
      )
      .toBe(true);
  });
});
