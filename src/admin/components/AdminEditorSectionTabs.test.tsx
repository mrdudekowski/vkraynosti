import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import AdminEditorSectionTabs from './AdminEditorSectionTabs';

const options = [
  { id: 'admin-catalog' as const, label: ADMIN_UI.sectionNav.catalog },
  { id: 'admin-about' as const, label: ADMIN_UI.sectionNav.about },
  { id: 'admin-gallery' as const, label: ADMIN_UI.sectionNav.gallery },
];

describe('AdminEditorSectionTabs', () => {
  it('стрелками ходит по вкладкам и называет вкладку с блокером', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AdminEditorSectionTabs
        label={ADMIN_UI.editorSections}
        value="admin-catalog"
        options={options}
        blockerIds={['admin-about']}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('tab', { name: ADMIN_UI.sectionNav.catalog })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByRole('tab', { name: `${ADMIN_UI.sectionNav.about}, ${ADMIN_UI.tabHasBlocker}` }),
    ).toBeInTheDocument();

    screen.getByRole('tab', { name: ADMIN_UI.sectionNav.catalog }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('admin-about');
  });
});
