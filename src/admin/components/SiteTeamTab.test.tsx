import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TeamContentDocument } from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import { AdminToastProvider } from './AdminToast';
import SiteTeamTab from './SiteTeamTab';

const document: TeamContentDocument = {
  kind: 'team',
  schemaVersion: 1,
  members: [
    {
      id: 'member-1',
      name: 'Элина',
      photo: {
        assetId: 'p1',
        url: 'https://ypnmfvotln.cdn.twcstorage.ru/team/elina.webp',
        mimeType: 'image/webp',
        alt: 'Элина',
      },
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

describe('SiteTeamTab', () => {
  it('opens one member workspace from the list and returns back', () => {
    render(
      <AdminToastProvider>
        <SiteTeamTab
          value={document}
          onChange={vi.fn()}
          onUpload={vi.fn()}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          isSaving={false}
        />
      </AdminToastProvider>,
    );

    const memberCard = screen.getByRole('button', { name: /Элина/ });
    expect(memberCard.closest('ul')).toHaveClass('sm:grid-cols-2');
    expect(memberCard).toHaveClass('admin-editor-surface');
    expect(screen.getByText(ADMIN_UI.onSiteCountSuffix)).toBeInTheDocument();
    expect(screen.queryByText(ADMIN_UI.siteMemberOnSite)).not.toBeInTheDocument();

    fireEvent.click(memberCard);
    expect(screen.getByLabelText(ADMIN_UI.siteMemberName)).toHaveValue('Элина');
    expect(screen.getByRole('button', { name: ADMIN_UI.siteSaveChanges })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.siteBackToMembers }));
    expect(screen.queryByLabelText(ADMIN_UI.siteMemberName)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Элина/ })).toBeInTheDocument();
  });
});
