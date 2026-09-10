import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SitePage from './SitePage';
import { adminGetSiteContent, adminSaveSiteContent } from './api';

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
    expect(window.location.hash).toBe('#/site');
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
    fireEvent.click(await screen.findByRole('tab', { name: 'Модальная заявка' }));
    await screen.findByRole('tabpanel', { name: 'Модальная заявка' });
    fireEvent.click(screen.getByText('Контакты', { selector: 'strong' }).closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    await waitFor(() => expect(adminSaveSiteContent).toHaveBeenCalledWith('modal', 1, expect.objectContaining({ requestFormEnabled: false })));
  });

  it('switches the editable modal content with the cards and toggle', async () => {
    render(<SitePage />);
    fireEvent.click(await screen.findByRole('tab', { name: 'Модальная заявка' }));
    await screen.findByText('Содержимое модалки «Заявка»');
    fireEvent.click(screen.getByText('Контакты', { selector: 'strong' }).closest('button')!);
    expect(await screen.findByText('Содержимое модалки «Контакты»')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Активный режим модалки' }));
    expect(await screen.findByText('Содержимое модалки «Заявка»')).toBeInTheDocument();
  });
});
