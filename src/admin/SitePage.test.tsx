import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SitePage from './SitePage';
import { adminGetSiteContent, adminPublishSiteContent, adminSaveSiteContent } from './api';

vi.mock('./api', () => ({
  adminGetSiteContent: vi.fn(),
  adminPublishSiteContent: vi.fn(),
  adminSaveSiteContent: vi.fn(),
  adminUploadSiteAsset: vi.fn(),
}));

const team = { kind: 'team', schemaVersion: 1, members: [] } as const;
const contacts = { kind: 'contacts', schemaVersion: 1, sectionVisible: true, channels: [] } as const;
const footer = { kind: 'footer', schemaVersion: 1, blocks: [] } as const;
const modal = { kind: 'modal', schemaVersion: 1, requestFormEnabled: true, contactTitle: 'Свяжитесь с нами', contactDescription: 'Выберите канал', tourContactTitle: 'Забронируйте тур' } as const;

describe('SitePage', () => {
  beforeEach(() => {
    window.location.hash = '#/site';
    vi.mocked(adminGetSiteContent).mockImplementation(async (kind) => ({
      document: kind === 'team' ? team : kind === 'contacts' ? contacts : kind === 'modal' ? modal : footer,
      meta: { rev: 1 },
    } as never));
  });

  it('switches panels without replacing the HashRouter route', async () => {
    render(<SitePage />);
    await screen.findByRole('tabpanel', { name: 'Команда' });

    fireEvent.click(screen.getByRole('tab', { name: 'Контакты' }));

    expect(await screen.findByRole('tabpanel')).toHaveAttribute('id', 'admin-panel-contacts');
    expect(window.location.hash).toBe('#/site?tab=contacts');
  });

  it('supports roving keyboard navigation for tabs', async () => {
    render(<SitePage />);
    await screen.findByRole('tabpanel', { name: 'Команда' });

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Команда' }), { key: 'ArrowRight' });

    await waitFor(() => expect(screen.getByRole('tab', { name: 'Контакты' })).toHaveAttribute('aria-selected', 'true'));
    expect(screen.getByRole('tab', { name: 'Контакты' })).toHaveAttribute('tabindex', '0');
  });

  it('saves the selected modal mode and keeps it after a reload', async () => {
    vi.mocked(adminSaveSiteContent).mockImplementation(async (_kind, _rev, document) => ({
      document,
      meta: { rev: 2 },
    } as never));
    render(<SitePage />);
    fireEvent.click(await screen.findByRole('tab', { name: 'Модалки' }));
    await screen.findByRole('tabpanel', { name: 'Модалки' });
    fireEvent.click(screen.getByRole('radio', { name: 'Контакты' }));
    fireEvent.click(screen.getByRole('button', { name: /Сохранить черновик/ }));
    await waitFor(() => expect(adminSaveSiteContent).toHaveBeenCalledWith('modal', 1, expect.objectContaining({ requestFormEnabled: false })));
  });

  it('does not publish an unsaved site draft', async () => {
    render(<SitePage />);
    fireEvent.click(await screen.findByRole('tab', { name: 'Модалки' }));
    await screen.findByRole('radiogroup', { name: 'Режим CTA' });
    fireEvent.click(screen.getByRole('radio', { name: 'Контакты' }));

    const publishButton = screen.getByRole('button', { name: /Опубликовать на сайте/ });
    expect(publishButton).toBeDisabled();
    expect(adminPublishSiteContent).not.toHaveBeenCalled();
  });

  it('switches the editable modal content with the mode selector', async () => {
    render(<SitePage />);
    fireEvent.click(await screen.findByRole('tab', { name: 'Модалки' }));
    await screen.findByText('Форма заявки');
    fireEvent.click(screen.getByRole('radio', { name: 'Контакты' }));
    expect(await screen.findByText('Содержимое модалки «Контакты»')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Заявка' }));
    expect(await screen.findByText('Форма заявки')).toBeInTheDocument();
  });

  it('exposes the active mode, complete page copy, and a truthful request preview', async () => {
    render(<SitePage />);
    expect(screen.getByText(/Команда, контакты, подвал и модалки/)).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('tab', { name: 'Модалки' }));

    expect(await screen.findByRole('radiogroup', { name: 'Режим CTA' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Заявка' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Активный режим: Заявка')).toBeInTheDocument();
    expect(screen.getByText('Форма заявки')).toBeInTheDocument();
    expect(screen.getByText('Имя')).toBeInTheDocument();
    expect(screen.getByText('Телефон')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отправить заявку' })).toBeDisabled();
    expect(screen.queryByText(/Карточки ниже/)).not.toBeInTheDocument();
  });

  it('moves keyboard focus when roving through site tabs', async () => {
    render(<SitePage />);
    const teamTab = await screen.findByRole('tab', { name: 'Команда' });
    teamTab.focus();
    fireEvent.keyDown(teamTab, { key: 'ArrowRight' });

    await waitFor(() => expect(screen.getByRole('tab', { name: 'Контакты' })).toHaveFocus());
  });

  it('makes the publication scope and actions explicit for modal CTA changes', async () => {
    render(<SitePage />);
    fireEvent.click(await screen.findByRole('tab', { name: 'Модалки' }));

    expect(screen.getByRole('button', { name: /Сохранить черновик/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Опубликовать на сайте/ })).toHaveClass('admin-btn-publish');
    expect(await screen.findByText(/Изменение применяется ко всем CTA/)).toBeInTheDocument();
  });

  it('keeps the modal editor when contact preview loading fails', async () => {
    vi.mocked(adminGetSiteContent).mockImplementation(async (kind) => {
      if (kind === 'contacts') throw new Error('site_content_load_failed');
      return { document: kind === 'modal' ? modal : kind === 'team' ? team : footer, meta: { rev: 1 } } as never;
    });

    render(<SitePage />);
    fireEvent.click(await screen.findByRole('tab', { name: 'Модалки' }));

    expect(await screen.findByText('Форма заявки')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Контакты' }));
    expect(await screen.findByText(/Каналы контактов недоступны/)).toBeInTheDocument();
  });

  it('explains missing site-content permission', async () => {
    vi.mocked(adminGetSiteContent).mockRejectedValue(new Error('forbidden'));
    render(<SitePage />);

    expect(await screen.findByText('У вас нет прав для редактирования или публикации этого раздела.')).toBeInTheDocument();
  });

  it('opens the modal tab from the site route query without replacing the route', async () => {
    window.location.hash = '#/site?tab=modal';
    render(<SitePage />);

    expect(await screen.findByRole('tabpanel', { name: 'Модалки' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/site?tab=modal');
  });

  it('gives contact visibility controls a contextual accessible name', async () => {
    const channelContacts = { ...contacts, channels: [{ id: 'telegram', label: 'Telegram', href: 'https://t.me/example', type: 'telegram', visible: true, order: 0 }] };
    vi.mocked(adminGetSiteContent).mockImplementation(async (kind) => ({
      document: kind === 'contacts' ? channelContacts : kind === 'team' ? team : kind === 'modal' ? modal : footer,
      meta: { rev: 1 },
    } as never));
    render(<SitePage />);
    fireEvent.click(await screen.findByRole('tab', { name: 'Контакты' }));

    expect(await screen.findByRole('checkbox', { name: 'Показывать Telegram' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://t.me/example')).toBeVisible();
  });
});
