import { expect, test, type Page } from '@playwright/test';
import { HOME_HERO_SECTION_ELEMENT_ID } from '../src/constants/homeHeroSnap';
import { HOME_SECTION_CONTACT, HOME_SECTION_TEAM } from '../src/constants/routes';
import { UI } from '../src/constants/ui';

const HOME_HASH_RE = /\/vkraynosti\/?$/;

function homeHeroSection(page: Page) {
  return page.locator(`#${HOME_HERO_SECTION_ELEMENT_ID}`);
}

function homeSection(page: Page, sectionId: string) {
  return page.locator(`#${sectionId}`);
}

async function gotoHome(page: Page) {
  await page.goto('./', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page).toHaveURL(HOME_HASH_RE);
}

async function clickNavbarHomeLink(page: Page, label: string) {
  const link = page
    .locator('nav[data-layout-navbar] ul.hidden.nav-desktop\\:flex')
    .getByRole('link', { name: label });
  await link.evaluate((anchor: HTMLAnchorElement) => anchor.click());
}

async function navigateHomeHash(page: Page, hash: string) {
  await page.evaluate(sectionId => {
    window.location.hash = sectionId;
  }, hash);
}

/** После смены hash: секция в DOM и в viewport (Lenis может отставать — дождаться или scrollIntoView). */
async function expectHomeSectionAnchored(page: Page, sectionId: string) {
  const section = homeSection(page, sectionId);
  await expect(section).toBeVisible({ timeout: 15_000 });
  try {
    await expect
      .poll(
        async () =>
          section.evaluate(node => {
            const rect = node.getBoundingClientRect();
            const navOffset = 80;
            return rect.top < window.innerHeight * 0.9 && rect.bottom > navOffset;
          }),
        { timeout: 8_000 }
      )
      .toBe(true);
  } catch {
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeInViewport({ timeout: 10_000 });
  }
}

async function clickMobileNavHomeLink(page: Page, label: string) {
  await page.getByTestId('burger-menu').click();
  const dialog = page.getByRole('dialog', { name: UI.nav.mobileMenuDialog });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('link', { name: label }).click();
}

test.describe('Home funnel: H1 gate → hero', () => {
  test.setTimeout(60_000);

  test('desktop: стрелка ворот ведёт к #home-hero', async ({ page }) => {
    await page.setViewportSize({ width: 1160, height: 900 });
    await gotoHome(page);

    const scrollHint = page.getByTestId('home-gate-scroll-to-hero');
    await expect(scrollHint).toBeVisible();
    await scrollHint.click();

    await expect(page).toHaveURL(new RegExp(`#${HOME_HERO_SECTION_ELEMENT_ID}$`));
    await expect(homeHeroSection(page)).toBeInViewport();
  });

  test('mobile: hash #home-hero после загрузки главной', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await gotoHome(page);
    await navigateHomeHash(page, HOME_HERO_SECTION_ELEMENT_ID);

    await expect(page).toHaveURL(new RegExp(`#${HOME_HERO_SECTION_ELEMENT_ID}$`));
    await expect(homeHeroSection(page)).toBeVisible();
    await expect(homeHeroSection(page)).toBeInViewport({ timeout: 15_000 });
  });
});

test.describe('Home funnel: якоря nav → team / contact', () => {
  test.setTimeout(60_000);

  test('desktop: ссылки «Команда» и «Контакты» скроллят к секциям', async ({ page }) => {
    await page.setViewportSize({ width: 1160, height: 900 });
    await gotoHome(page);

    await clickNavbarHomeLink(page, 'Команда');
    await expect(page).toHaveURL(new RegExp(`#${HOME_SECTION_TEAM}$`));
    await expectHomeSectionAnchored(page, HOME_SECTION_TEAM);

    await clickNavbarHomeLink(page, 'Контакты');
    await expect(page).toHaveURL(new RegExp(`#${HOME_SECTION_CONTACT}$`));
    await expectHomeSectionAnchored(page, HOME_SECTION_CONTACT);
  });

  test('mobile: burger → «Команда» и «Контакты»', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await gotoHome(page);

    await clickMobileNavHomeLink(page, 'Команда');
    await expect(page).toHaveURL(new RegExp(`#${HOME_SECTION_TEAM}$`));
    await expect(homeSection(page, HOME_SECTION_TEAM)).toBeVisible({ timeout: 15_000 });

    await clickMobileNavHomeLink(page, 'Контакты');
    await expect(page).toHaveURL(new RegExp(`#${HOME_SECTION_CONTACT}$`));
    await expect(homeSection(page, HOME_SECTION_CONTACT)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Home funnel: H3 tours anchor', () => {
  test.setTimeout(60_000);

  test('desktop: nav «Направления» открывает #tours', async ({ page }) => {
    await page.setViewportSize({ width: 1160, height: 900 });
    await gotoHome(page);

    await clickNavbarHomeLink(page, UI.nav.links[0].label);
    await expect(page).toHaveURL(
      new RegExp(`#${UI.sections.homeToursSectionElementId}$`)
    );
    await expectHomeSectionAnchored(page, UI.sections.homeToursSectionElementId);
  });
});
