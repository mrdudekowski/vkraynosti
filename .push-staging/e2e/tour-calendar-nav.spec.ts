import { expect, test } from '@playwright/test';
import { UI } from '../src/constants/ui';

const calendarNavLabel =
  UI.nav.links.find(link => link.hash === UI.sections.homeTourCalendarSectionElementId)?.label ??
  'Календарь';

test.describe('Navbar: календарь', () => {
  test('desktop: клик «Календарь» ведёт на /#kalendar', async ({ page }) => {
    await page.setViewportSize({ width: 1160, height: 900 });
    await page.goto('./');
    await page.locator('nav').getByRole('link', { name: calendarNavLabel }).click();
    await expect(page).toHaveURL(/#kalendar$/);
    await expect(page.locator(`#${UI.sections.homeTourCalendarSectionElementId}`)).toBeVisible();
  });

  test('burger: клик «Календарь» ведёт на /#kalendar и закрывает меню', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto('./');
    await page.getByTestId('burger-menu').click();
    const dialog = page.getByRole('dialog', { name: UI.nav.mobileMenuDialog });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('link', { name: calendarNavLabel }).click();
    await expect(page).toHaveURL(/#kalendar$/);
    await expect(dialog).toBeHidden();
  });
});
