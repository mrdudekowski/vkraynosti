import { expect, test, type Page } from '@playwright/test';
import { ADMIN_UI } from '../../src/admin/constants/ui';
import { GUEST_SCHEDULE_STATUSES } from '../../src/cms/publishQueue';
import { CMS_E2E_RELEASE_ONE } from '../../scripts/cms/e2e-release-one-config.ts';

async function loginAs(page: Page, login: string, password: string) {
  await page.goto('admin/#/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: ADMIN_UI.loginTitle })).toBeVisible();
  await page.getByLabel(ADMIN_UI.loginLabel).fill(login);
  await page.getByLabel(ADMIN_UI.passwordLabel).fill(password);
  await page.getByRole('button', { name: ADMIN_UI.loginSubmit }).click();
  await expect(page.getByRole('heading', { name: ADMIN_UI.dashboardTitle })).toBeVisible();
}

test('incomplete tour cannot add a departure; editor submits, admin publishes, guest hides planned/cancelled', async ({
  page,
  request,
}) => {
  await loginAs(page, CMS_E2E_RELEASE_ONE.editorLogin, CMS_E2E_RELEASE_ONE.editorPassword);

  await page.goto(`admin/#/tours/${CMS_E2E_RELEASE_ONE.incompleteTourId}`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByRole('heading', { name: CMS_E2E_RELEASE_ONE.incompleteTourTitle })).toBeVisible();
  await expect(page.getByRole('button', { name: ADMIN_UI.scheduleAddFromTour })).toBeDisabled();

  await page.goto(`admin/#/schedule?date=${CMS_E2E_RELEASE_ONE.openDate}`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByRole('heading', { name: ADMIN_UI.scheduleTitle })).toBeVisible();
  await page
    .getByRole('button', { name: `${ADMIN_UI.scheduleEmptyCell} ${CMS_E2E_RELEASE_ONE.openDate}` })
    .click();
  const wizard = page.getByRole('dialog');
  await expect(wizard.getByRole('heading', { name: ADMIN_UI.scheduleWizardTitle })).toBeVisible();
  await wizard.getByRole('button', { name: CMS_E2E_RELEASE_ONE.readyTourTitle }).click();
  await wizard.getByRole('button', { name: ADMIN_UI.scheduleWizardNext }).click();
  await wizard.getByRole('button', { name: ADMIN_UI.scheduleWizardNext }).click();
  await wizard.getByRole('button', { name: ADMIN_UI.scheduleWizardSubmit }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('button', {
      name: `${CMS_E2E_RELEASE_ONE.readyTourTitle} ${CMS_E2E_RELEASE_ONE.openDate}`,
    }),
  ).toBeVisible();

  const editorSubmit = page.getByRole('button', { name: ADMIN_UI.inboxSubmit });
  await expect(editorSubmit).toBeEnabled();
  await editorSubmit.click();
  await expect(editorSubmit).toBeEnabled();

  await page.getByRole('button', { name: ADMIN_UI.logout }).click();
  await loginAs(page, CMS_E2E_RELEASE_ONE.adminLogin, CMS_E2E_RELEASE_ONE.adminPassword);

  await page.goto(`admin/#/tours/${CMS_E2E_RELEASE_ONE.readyTourId}`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByRole('heading', { name: CMS_E2E_RELEASE_ONE.readyTourTitle })).toBeVisible();
  await page.getByRole('button', { name: ADMIN_UI.publish }).click();
  await expect(page.getByText(ADMIN_UI.published)).toBeVisible();

  await page.goto(`admin/#/schedule?date=${CMS_E2E_RELEASE_ONE.openDate}`, {
    waitUntil: 'domcontentloaded',
  });
  const publishSchedule = page.getByRole('button', { name: ADMIN_UI.publishSchedule });
  await expect(publishSchedule).toBeEnabled();
  await publishSchedule.click();
  await expect(publishSchedule).toBeEnabled();

  const guest = await request.get(
    `http://127.0.0.1:${CMS_E2E_RELEASE_ONE.apiPort}/__e2e__/schedule`,
  );
  expect(guest.ok()).toBe(true);
  const payload = (await guest.json()) as { events?: Array<{ date: string; status: string }> };
  const events = payload.events ?? [];
  expect(events.some((event) => event.date === CMS_E2E_RELEASE_ONE.openDate && event.status === 'open')).toBe(
    true,
  );
  expect(events.some((event) => event.date === CMS_E2E_RELEASE_ONE.plannedDate)).toBe(false);
  expect(events.some((event) => event.date === CMS_E2E_RELEASE_ONE.cancelledDate)).toBe(false);
  expect(events.every((event) => (GUEST_SCHEDULE_STATUSES as readonly string[]).includes(event.status))).toBe(
    true,
  );
});
