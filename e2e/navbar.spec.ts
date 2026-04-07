import { expect, test } from '@playwright/test';
import { UI } from '../src/constants/ui';

const firstNavLinkLabel = UI.nav.links[0].label;

test.describe('Navbar: подпись сезона у логотипа', () => {
  test('текст сезона скрыт при ширине ниже xs (360px)', async ({ page }) => {
    await page.setViewportSize({ width: 359, height: 800 });
    await page.goto('.');
    await expect(page.getByTestId('season-indicator')).toBeHidden();
  });

  test('текст сезона виден при 499px (рядом с логотипом)', async ({ page }) => {
    await page.setViewportSize({ width: 499, height: 800 });
    await page.goto('.');
    await expect(page.getByTestId('season-indicator')).toBeVisible();
  });

  test('текст сезона виден при ширине 500px', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('.');
    await expect(page.getByTestId('season-indicator')).toBeVisible();
  });
});

test.describe('SeasonNavDock', () => {
  test('dock в layout ниже 500px (display block; свёрнут — не в viewport для toBeVisible)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 499, height: 800 });
    await page.goto('.');
    await expect(page.getByTestId('season-nav-dock')).toHaveCSS('display', 'block');
  });

  test('dock скрыт при 500px и выше', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('.');
    await expect(page.getByTestId('season-nav-dock')).toBeHidden();
  });

  test('панель сезонов открывается по кнопке в navbar', async ({ page }) => {
    await page.setViewportSize({ width: 499, height: 800 });
    await page.goto('.');
    const dock = page.getByTestId('season-nav-dock');
    await expect(dock).toHaveCSS('display', 'block');
    await expect(dock).not.toHaveAttribute('data-expanded');
    await page.getByTestId('season-nav-toggle').click();
    await expect(dock).toHaveAttribute('data-expanded', '');
    await expect(dock).toBeVisible();
  });
});

test.describe('Navbar: критические пороги viewport (950 / 768 / 500)', () => {
  test('950px: десктопные ссылки в `<nav>`, бургер скрыт', async ({ page }) => {
    await page.setViewportSize({ width: 950, height: 800 });
    await page.goto('.');
    await expect(page.getByTestId('burger-menu')).toBeHidden();
    await expect(page.locator('nav').getByRole('link', { name: firstNavLinkLabel })).toBeVisible();
  });

  test('768px: бургер виден, центральные ссылки в `<nav>` скрыты', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await page.goto('.');
    await expect(page.getByTestId('burger-menu')).toBeVisible();
    await expect(page.locator('nav').getByRole('link', { name: firstNavLinkLabel })).toBeHidden();
  });

  test('500px: SeasonNavDock скрыт, подпись сезона у логотипа видна', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('.');
    await expect(page.getByTestId('season-nav-dock')).toBeHidden();
    await expect(page.getByTestId('season-indicator')).toBeVisible();
  });
});
