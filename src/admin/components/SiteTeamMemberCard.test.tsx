import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TeamContentMember } from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import SiteTeamMemberCard from './SiteTeamMemberCard';

const member = (patch: Partial<TeamContentMember> = {}): TeamContentMember => ({
  id: 'member-1',
  name: 'Элина',
  photo: {
    assetId: 'photo-1',
    url: 'https://ypnmfvotln.cdn.twcstorage.ru/team/elina.webp',
    mimeType: 'image/webp',
    alt: 'Элина',
  },
  role: 'Гид',
  roleVisible: true,
  experience: 'в родном крае',
  experienceVisible: false,
  bio: 'Описание',
  bioVisible: true,
  visible: true,
  order: 0,
  ...patch,
});

describe('SiteTeamMemberCard', () => {
  it('shows a status chip, not a header checkbox, and keeps hidden fields editable', () => {
    const onPatch = vi.fn();
    render(
      <SiteTeamMemberCard
        member={member({ visible: true, experienceVisible: false })}
        index={0}
        total={2}
        onPatch={onPatch}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onUpload={vi.fn()}
      />,
    );

    expect(screen.getByText(ADMIN_UI.siteMemberOnSite)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.removeItem })).toHaveTextContent(
      ADMIN_UI.removeItem,
    );
    expect(screen.getByRole('button', { name: ADMIN_UI.moveUp })).toBeDisabled();
    expect(screen.getByRole('button', { name: ADMIN_UI.moveDown })).toBeEnabled();
    expect(screen.getByLabelText(ADMIN_UI.siteMemberExperience)).not.toBeDisabled();
    expect(screen.getByText(ADMIN_UI.siteShowMemberHint)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.sitePhotoAltHint)).toBeInTheDocument();
    expect(screen.getByText('8/1000')).toBeInTheDocument();
    expect(screen.getByLabelText(ADMIN_UI.sitePhotoHint)).toBeInTheDocument();
  });

  it('uses a muted hidden status without disabling the name field', () => {
    render(
      <SiteTeamMemberCard
        member={member({ visible: false, name: '' })}
        index={1}
        total={2}
        onPatch={vi.fn()}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onUpload={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: ADMIN_UI.siteMemberUntitled })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.siteMemberHidden)).toBeInTheDocument();
    expect(screen.getByLabelText(ADMIN_UI.siteMemberName)).not.toBeDisabled();
    expect(screen.getByRole('button', { name: ADMIN_UI.moveDown })).toBeDisabled();
  });

  it('forwards photo uploads from the dropzone', () => {
    const onUpload = vi.fn();
    render(
      <SiteTeamMemberCard
        member={member()}
        index={0}
        total={1}
        onPatch={vi.fn()}
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onUpload={onUpload}
      />,
    );

    fireEvent.change(screen.getByLabelText(ADMIN_UI.sitePhotoHint), {
      target: { files: [new File(['jpg'], 'elina.jpg', { type: 'image/jpeg' })] },
    });
    expect(onUpload).toHaveBeenCalledWith(expect.any(File));
  });
});
