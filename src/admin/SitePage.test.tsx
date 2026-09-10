import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SitePage from './SitePage';
import { adminGetSiteContent } from './api';

vi.mock('./api', () => ({
  adminGetSiteContent: vi.fn(),
  adminPublishSiteContent: vi.fn(),
  adminSaveSiteContent: vi.fn(),
  adminUploadSiteAsset: vi.fn(),
}));

const team = { kind: 'team', schemaVersion: 1, members: [] } as const;
const contacts = { kind: 'contacts', schemaVersion: 1, sectionVisible: true, channels: [] } as const;
const footer = { kind: 'footer', schemaVersion: 1, blocks: [] } as const;

describe('SitePage', () => {
  beforeEach(() => {
    window.location.hash = '#/site';
    vi.mocked(adminGetSiteContent).mockImplementation(async (kind) => ({
      document: kind === 'team' ? team : kind === 'contacts' ? contacts : footer,
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
});
