import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from './constants/ui';
import { AdminToastProvider } from './components/AdminToast';
import SitePage from './SitePage';
import { adminGetSiteContent, adminPublishSiteContent, adminSaveSiteContent, adminUploadSiteAsset } from './api';

vi.mock('./api', () => ({
  adminGetSiteContent: vi.fn(),
  adminPublishSiteContent: vi.fn(),
  adminSaveSiteContent: vi.fn(),
  adminUploadSiteAsset: vi.fn(),
}));

const team = { kind: 'team', schemaVersion: 1, members: [] } as const;
const contacts = { kind: 'contacts', schemaVersion: 1, sectionVisible: true, channels: [] } as const;
const footer = { kind: 'footer', schemaVersion: 1, blocks: [] } as const;
const modal = {
  kind: 'modal',
  schemaVersion: 1,
  requestFormEnabled: true,
  contactTitle: 'Свяжитесь с нами',
  contactDescription: 'Выберите канал',
  tourContactTitle: 'Забронируйте тур',
} as const;

function renderSite() {
  return render(
    <AdminToastProvider>
      <SitePage />
    </AdminToastProvider>,
  );
}

describe('SitePage', () => {
  beforeEach(() => {
    window.location.hash = '#/site';
    vi.clearAllMocks();
    vi.mocked(adminGetSiteContent).mockImplementation(async (kind) => ({
      document: kind === 'team' ? team : kind === 'contacts' ? contacts : kind === 'modal' ? modal : footer,
      meta: { rev: 1 },
    } as never));
  });

  it('switches panels without replacing the HashRouter route', async () => {
    renderSite();
    await screen.findByRole('tabpanel', { name: ADMIN_UI.siteTabTeam });

    fireEvent.click(screen.getByRole('tab', { name: ADMIN_UI.siteTabContacts }));

    expect(await screen.findByRole('tabpanel')).toHaveAttribute('id', 'admin-panel-contacts');
    expect(window.location.hash).toBe('#/site?tab=contacts');
  });

  it('supports roving keyboard navigation for tabs', async () => {
    renderSite();
    await screen.findByRole('tabpanel', { name: ADMIN_UI.siteTabTeam });

    fireEvent.keyDown(screen.getByRole('tab', { name: ADMIN_UI.siteTabTeam }), { key: 'ArrowRight' });

    await waitFor(() =>
      expect(screen.getByRole('tab', { name: ADMIN_UI.siteTabContacts })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(screen.getByRole('tab', { name: ADMIN_UI.siteTabContacts })).toHaveAttribute('tabindex', '0');
  });

  it('stacks site tabs like other admin editors on a narrow viewport', async () => {
    renderSite();
    await screen.findByRole('tabpanel', { name: ADMIN_UI.siteTabTeam });

    expect(screen.getByRole('tablist', { name: ADMIN_UI.siteTabs })).toHaveClass('grid-cols-1');
    expect(screen.getByRole('tablist', { name: ADMIN_UI.siteTabs })).not.toHaveClass('overflow-x-auto');
  });

  it('saves the selected modal mode and keeps it after a reload', async () => {
    vi.mocked(adminSaveSiteContent).mockImplementation(async (_kind, _rev, document) => ({
      document,
      meta: { rev: 2 },
    } as never));
    renderSite();
    fireEvent.click(await screen.findByRole('tab', { name: ADMIN_UI.siteTabModal }));
    await screen.findByRole('tabpanel', { name: ADMIN_UI.siteTabModal });
    fireEvent.click(screen.getByRole('radio', { name: ADMIN_UI.siteModalContacts }));
    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.siteSaveDraft }));
    await waitFor(() =>
      expect(adminSaveSiteContent).toHaveBeenCalledWith(
        'modal',
        1,
        expect.objectContaining({ requestFormEnabled: false }),
      ),
    );
  });

  it('does not publish an unsaved site draft', async () => {
    renderSite();
    fireEvent.click(await screen.findByRole('tab', { name: ADMIN_UI.siteTabModal }));
    await screen.findByRole('radiogroup', { name: ADMIN_UI.siteCtaMode });
    fireEvent.click(screen.getByRole('radio', { name: ADMIN_UI.siteModalContacts }));

    const publishButton = screen.getByRole('button', { name: ADMIN_UI.sitePublish });
    expect(publishButton).toBeDisabled();
    expect(adminPublishSiteContent).not.toHaveBeenCalled();
  });

  it('switches the editable modal content with the mode selector', async () => {
    renderSite();
    fireEvent.click(await screen.findByRole('tab', { name: ADMIN_UI.siteTabModal }));
    await screen.findByText(ADMIN_UI.siteModalRequestTitle);
    fireEvent.click(screen.getByRole('radio', { name: ADMIN_UI.siteModalContacts }));
    expect(await screen.findByText(ADMIN_UI.siteModalContactsTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: ADMIN_UI.siteModalRequest }));
    expect(await screen.findByText(ADMIN_UI.siteModalRequestTitle)).toBeInTheDocument();
  });

  it('explains the request CTA without a fake submit form', async () => {
    renderSite();
    expect(screen.getByText(ADMIN_UI.siteDescription)).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('tab', { name: ADMIN_UI.siteTabModal }));

    expect(await screen.findByRole('radiogroup', { name: ADMIN_UI.siteCtaMode })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: ADMIN_UI.siteModalRequest })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByText(ADMIN_UI.siteModalRequestTitle)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Отправить заявку' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Карточки ниже/)).not.toBeInTheDocument();
  });

  it('moves keyboard focus when roving through site tabs', async () => {
    renderSite();
    const teamTab = await screen.findByRole('tab', { name: ADMIN_UI.siteTabTeam });
    teamTab.focus();
    fireEvent.keyDown(teamTab, { key: 'ArrowRight' });

    await waitFor(() => expect(screen.getByRole('tab', { name: ADMIN_UI.siteTabContacts })).toHaveFocus());
  });

  it('makes the publication scope and actions explicit for modal CTA changes', async () => {
    renderSite();
    fireEvent.click(await screen.findByRole('tab', { name: ADMIN_UI.siteTabModal }));

    expect(screen.getByRole('button', { name: ADMIN_UI.siteSaveDraft })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.sitePublish })).toHaveClass('admin-btn-publish');
    expect(await screen.findByText(ADMIN_UI.siteCtaScope)).toBeInTheDocument();
  });

  it('keeps the modal editor when contact preview loading fails', async () => {
    vi.mocked(adminGetSiteContent).mockImplementation(async (kind) => {
      if (kind === 'contacts') throw new Error('site_content_load_failed');
      return {
        document: kind === 'modal' ? modal : kind === 'team' ? team : footer,
        meta: { rev: 1 },
      } as never;
    });

    renderSite();
    fireEvent.click(await screen.findByRole('tab', { name: ADMIN_UI.siteTabModal }));

    expect(await screen.findByText(ADMIN_UI.siteModalRequestTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: ADMIN_UI.siteModalContacts }));
    expect(await screen.findByText(ADMIN_UI.siteContactsPreviewError)).toBeInTheDocument();
  });

  it('explains missing site-content permission', async () => {
    vi.mocked(adminGetSiteContent).mockRejectedValue(new Error('forbidden'));
    renderSite();

    expect(
      await screen.findByText('У вас нет прав для редактирования или публикации этого раздела.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.retry })).toBeInTheDocument();
  });

  it('opens the modal tab from the site route query without replacing the route', async () => {
    window.location.hash = '#/site?tab=modal';
    renderSite();

    expect(await screen.findByRole('tabpanel', { name: ADMIN_UI.siteTabModal })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/site?tab=modal');
  });

  it('gives contact visibility controls a contextual accessible name', async () => {
    const channelContacts = {
      ...contacts,
      channels: [
        {
          id: 'telegram',
          label: 'Telegram',
          href: 'https://t.me/example',
          type: 'telegram',
          visible: true,
          order: 0,
        },
      ],
    };
    vi.mocked(adminGetSiteContent).mockImplementation(async (kind) => ({
      document:
        kind === 'contacts'
          ? channelContacts
          : kind === 'team'
            ? team
            : kind === 'modal'
              ? modal
              : footer,
      meta: { rev: 1 },
    } as never));
    renderSite();
    fireEvent.click(await screen.findByRole('tab', { name: ADMIN_UI.siteTabContacts }));

    expect(await screen.findByRole('checkbox', { name: 'Показывать Telegram' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://t.me/example')).toBeVisible();
    expect(screen.getByLabelText(ADMIN_UI.siteChannelType)).toHaveValue('telegram');
  });

  it('adds a channel with an explicit type', async () => {
    renderSite();
    fireEvent.click(await screen.findByRole('tab', { name: ADMIN_UI.siteTabContacts }));
    await screen.findByText(ADMIN_UI.siteContactsEmpty);
    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.siteAddChannel }));

    expect(screen.getByLabelText(ADMIN_UI.siteChannelType)).toHaveValue('link');
    expect(screen.getByRole('option', { name: ADMIN_UI.siteChannelTypes.email })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: ADMIN_UI.siteChannelTypes.max })).toBeInTheDocument();
  });

  it('confirms team member deletion and can undo', async () => {
    const teamWithMember = {
      ...team,
      members: [
        {
          id: 'member-1',
          name: 'Анна',
          photo: { assetId: 'photo-1', url: 'https://cdn.example/anna.webp', mimeType: 'image/webp', alt: 'Анна' },
          role: 'Гид',
          roleVisible: true,
          experience: '',
          experienceVisible: false,
          bio: '',
          bioVisible: true,
          visible: true,
          order: 0,
        },
      ],
    };
    vi.mocked(adminGetSiteContent).mockImplementation(async (kind) => ({
      document: kind === 'team' ? teamWithMember : kind === 'contacts' ? contacts : kind === 'modal' ? modal : footer,
      meta: { rev: 1 },
    } as never));
    renderSite();
    expect(await screen.findByLabelText(ADMIN_UI.siteMemberName)).toHaveValue('Анна');

    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.removeItem }));
    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.siteDeleteMemberConfirm }));

    expect(screen.queryByLabelText(ADMIN_UI.siteMemberName)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.undo }));
    expect(screen.getByLabelText(ADMIN_UI.siteMemberName)).toHaveValue('Анна');
  });

  it('adds footer rows of each type', async () => {
    renderSite();
    fireEvent.click(await screen.findByRole('tab', { name: ADMIN_UI.siteTabFooter }));
    await screen.findByText(ADMIN_UI.siteFooterEmpty);
    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.siteAddBlock }));
    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.siteAddRow }));

    expect(screen.getByLabelText(ADMIN_UI.siteFooterRowType)).toHaveValue('text');
    fireEvent.change(screen.getByLabelText(ADMIN_UI.siteFooterRowType), { target: { value: 'link' } });
    expect(screen.getByLabelText(ADMIN_UI.siteFooterHref)).toBeInTheDocument();
  });

  it('autosaves a dirty site draft', async () => {
    vi.mocked(adminSaveSiteContent).mockImplementation(async (_kind, _rev, document) => ({
      document,
      meta: { rev: 2 },
    } as never));
    renderSite();
    fireEvent.click(await screen.findByRole('tab', { name: ADMIN_UI.siteTabModal }));
    await screen.findByRole('radiogroup', { name: ADMIN_UI.siteCtaMode });
    fireEvent.click(screen.getByRole('radio', { name: ADMIN_UI.siteModalContacts }));
    await waitFor(() => expect(adminSaveSiteContent).toHaveBeenCalled(), { timeout: 2000 });
  });

  it('warns before leaving with unsaved site changes', async () => {
    renderSite();
    fireEvent.click(await screen.findByRole('tab', { name: ADMIN_UI.siteTabModal }));
    await screen.findByRole('radiogroup', { name: ADMIN_UI.siteCtaMode });
    fireEvent.click(screen.getByRole('radio', { name: ADMIN_UI.siteModalContacts }));

    const event = new Event('beforeunload', { cancelable: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('does not save a team member without a photo', async () => {
    renderSite();
    await screen.findByRole('tabpanel', { name: ADMIN_UI.siteTabTeam });
    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.siteAddMember }));
    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.siteSaveDraft }));

    expect(adminSaveSiteContent).not.toHaveBeenCalled();
    expect(screen.getByText(ADMIN_UI.sitePhotoRequired)).toBeInTheDocument();
  });

  it('uploads a team photo including HEIC and rejects GIF', async () => {
    const teamWithMember = {
      ...team,
      members: [
        {
          id: 'member-1',
          name: 'Анна',
          photo: { assetId: 'photo-1', url: 'https://cdn.example/anna.webp', mimeType: 'image/webp', alt: 'Анна' },
          role: 'Гид',
          roleVisible: true,
          experience: '',
          experienceVisible: false,
          bio: '',
          bioVisible: true,
          visible: true,
          order: 0,
        },
      ],
    };
    vi.mocked(adminGetSiteContent).mockImplementation(async (kind) => ({
      document: kind === 'team' ? teamWithMember : kind === 'contacts' ? contacts : kind === 'modal' ? modal : footer,
      meta: { rev: 1 },
    } as never));
    vi.mocked(adminUploadSiteAsset).mockResolvedValue({
      asset: { assetId: 'photo-2', url: 'https://cdn.example/anna.jpg', mimeType: 'image/jpeg', alt: 'Анна' },
    });
    renderSite();
    const input = await screen.findByLabelText(ADMIN_UI.sitePhotoHint);

    fireEvent.change(input, {
      target: { files: [new File(['gif'], 'anna.gif', { type: 'image/gif' })] },
    });
    expect(adminUploadSiteAsset).not.toHaveBeenCalled();
    expect(screen.getByText(ADMIN_UI.sitePhotoFormatError)).toBeInTheDocument();

    fireEvent.change(input, {
      target: { files: [new File(['heic'], 'anna.heic', { type: 'image/heic' })] },
    });
    await waitFor(() =>
      expect(adminUploadSiteAsset).toHaveBeenCalledWith(
        'team',
        expect.any(File),
        'Анна',
      ),
    );

    fireEvent.change(input, {
      target: { files: [new File(['jpg'], 'anna.jpg', { type: 'image/jpeg' })] },
    });
    await waitFor(() =>
      expect(adminUploadSiteAsset).toHaveBeenCalledWith(
        'team',
        expect.any(File),
        'Анна',
      ),
    );
  });
});
