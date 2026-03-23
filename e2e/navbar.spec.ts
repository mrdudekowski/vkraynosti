import { expect, test } from '@playwright/test';

test.describe('Navbar: подпись сезона у логотипа', () => {
  test('текст сезона скрыт при ширине ниже xs (360px)', async ({ page }) => {
    await page.setViewportSize({ width: 359, height: 800 });
    await page.goto('/');
    await expect(page.getByTestId('season-indicator')).toBeHidden();
  });

  test('текст сезона виден при 499px (рядом с логотипом)', async ({ page }) => {
    await page.setViewportSize({ width: 499, height: 800 });
    await page.goto('/');
    await expect(page.getByTestId('season-indicator')).toBeVisible();
  });

  test('текст сезона виден при ширине 500px', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('/');
    await expect(page.getByTestId('season-indicator')).toBeVisible();
  });
});

test.describe('SeasonNavDock', () => {
  test('dock виден только ниже 500px', async ({ page }) => {
    await page.setViewportSize({ width: 499, height: 800 });
    await page.goto('/');
    await expect(page.getByTestId('season-nav-dock')).toBeVisible();
  });

  test('dock скрыт при 500px и выше', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('/');
    await expect(page.getByTestId('season-nav-dock')).toBeHidden();
  });
});
