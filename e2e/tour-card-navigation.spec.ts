import { expect, test, type Page } from '@playwright/test';
import { UI } from '../src/constants/ui';

const TOUR_DETAIL_PATH_RE = /\/tours\/(winter|spring|summer|fall)\/[^/]+\/?$/;

function toursSection(page: Page) {
  return page.locator(`#${UI.sections.homeToursSectionElementId}`);
}

async function openFirstTourFromHomeGrid(page: Page): Promise<string> {
  await page.goto('./');
  const section = toursSection(page);
  await section.scrollIntoViewIfNeeded();
  await expect(section).toBeVisible();

  const tourLink = section.getByRole('link').first();
  await expect(tourLink).toBeVisible();
  const href = await tourLink.getAttribute('href');
  expect(href, 'TourCard must link to tour detail').toMatch(TOUR_DETAIL_PATH_RE);

  await tourLink.click();
  return href ?? '';
}

test.describe('Home → Tour detail: клик по TourCard', () => {
  test('desktop: карточка в #tours открывает страницу тура', async ({ page }) => {
    await page.setViewportSize({ width: 950, height: 900 });
    await openFirstTourFromHomeGrid(page);

    await expect(page).toHaveURL(TOUR_DETAIL_PATH_RE);
    await expect(page.getByTestId('tour-detail-main')).toBeVisible();
  });

  test('mobile: карточка в #tours открывает страницу тура', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openFirstTourFromHomeGrid(page);

    await expect(page).toHaveURL(TOUR_DETAIL_PATH_RE);
    await expect(page.getByTestId('tour-detail-main')).toBeVisible();
  });
});
