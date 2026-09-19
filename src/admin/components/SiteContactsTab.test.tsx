import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ContactsContentDocument } from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import { AdminToastProvider } from './AdminToast';
import SiteContactsTab from './SiteContactsTab';

const document: ContactsContentDocument = {
  kind: 'contacts',
  schemaVersion: 1,
  sectionVisible: true,
  channels: [
    {
      id: 'channel-1',
      label: 'Telegram',
      href: 'https://t.me/example',
      type: 'telegram',
      visible: true,
      order: 0,
    },
  ],
};

describe('SiteContactsTab', () => {
  it('shows a dense channel list instead of nested editor cards', () => {
    render(
      <AdminToastProvider>
        <SiteContactsTab value={document} onChange={vi.fn()} />
      </AdminToastProvider>,
    );

    expect(screen.queryByRole('heading', { name: ADMIN_UI.siteTabContacts })).not.toBeInTheDocument();
    expect(screen.getByLabelText(ADMIN_UI.siteChannelType)).toHaveValue('telegram');
    expect(screen.getByDisplayValue('https://t.me/example')).toBeVisible();
    expect(screen.getByRole('button', { name: ADMIN_UI.siteShowChannel('Telegram') })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getAllByText(ADMIN_UI.onSiteCountSuffix).length).toBeGreaterThan(0);
  });

  it('toggles channel visibility from the status control', () => {
    const onChange = vi.fn();
    render(
      <AdminToastProvider>
        <SiteContactsTab value={document} onChange={onChange} />
      </AdminToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.siteShowChannel('Telegram') }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        channels: [expect.objectContaining({ visible: false })],
      }),
    );
  });
});
