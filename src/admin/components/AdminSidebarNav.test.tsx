import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutDashboard, Map as MapIcon } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AdminNavItem } from '../constants/nav';
import { ADMIN_UI } from '../constants/ui';
import AdminSidebarNav from './AdminSidebarNav';

const items: AdminNavItem[] = [
  {
    id: 'dashboard',
    to: '/',
    label: 'Обзор',
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === '/',
  },
  {
    id: 'tours',
    to: '/tours',
    label: 'Туры',
    icon: MapIcon,
    isActive: (pathname) => pathname.startsWith('/tours'),
  },
];

const renderNav = (props: Partial<React.ComponentProps<typeof AdminSidebarNav>> = {}) =>
  render(
    <MemoryRouter initialEntries={['/tours/one']}>
      <AdminSidebarNav
        items={items}
        compact={false}
        pathname="/tours/one"
        {...props}
      />
    </MemoryRouter>,
  );

function createDataTransfer(initialType: string, initialValue: string) {
  const values = new Map([[initialType, initialValue]]);
  return {
    effectAllowed: '',
    dropEffect: '',
    setData: vi.fn((type: string, value: string) => values.set(type, value)),
    getData: vi.fn((type: string) => values.get(type) ?? ''),
  } as unknown as DataTransfer;
}

describe('AdminSidebarNav', () => {
  it('renders labels, icons, and the active route with existing nav classes', () => {
    renderNav();

    expect(screen.getByRole('link', { name: 'Обзор' })).toHaveClass('admin-sidebar-nav');
    expect(screen.getByRole('link', { name: 'Туры' })).toHaveClass('admin-sidebar-nav-active');
    expect(screen.getByRole('link', { name: 'Туры' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Обзор' }).querySelector('svg')).toBeInTheDocument();
  });

  it('keeps labels accessible when compact', () => {
    renderNav({ compact: true });

    expect(screen.getByRole('link', { name: 'Туры' })).toHaveAttribute('title', 'Туры');
    expect(screen.getByText('Туры')).toHaveClass('sr-only');
  });

  it('reorders visible items through native drag and drop', () => {
    const onReorder = vi.fn();
    renderNav({ onReorder });
    const source = screen.getByRole('link', { name: 'Обзор' });
    const target = screen.getByRole('link', { name: 'Туры' });
    const dataTransfer = createDataTransfer('application/x-admin-sidebar-item', '0');

    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });

    expect(dataTransfer.effectAllowed).toBe('move');
    expect(dataTransfer.dropEffect).toBe('move');
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'application/x-admin-sidebar-item',
      '0',
    );
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', '0');
    expect(onReorder).toHaveBeenCalledWith(0, 1);
  });

  it('ignores empty and unsupported drag payloads', () => {
    const onReorder = vi.fn();
    const onDropOverflow = vi.fn();
    renderNav({ onReorder, onDropOverflow });
    const target = screen.getByRole('link', { name: 'Туры' });

    const emptyPayload = createDataTransfer('text/plain', '');
    fireEvent.drop(target, { dataTransfer: emptyPayload });

    const unsupportedPayload = createDataTransfer(
      'application/x-admin-sidebar-overflow',
      'not-a-nav-id',
    );
    fireEvent.drop(target, { dataTransfer: unsupportedPayload });

    expect(onReorder).not.toHaveBeenCalled();
    expect(onDropOverflow).not.toHaveBeenCalled();
  });

  it('does not navigate after a drag gesture', () => {
    const onNavigate = vi.fn();
    renderNav({ onNavigate });
    const source = screen.getByRole('link', { name: 'Обзор' });
    const dataTransfer = createDataTransfer('application/x-admin-sidebar-item', '0');

    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.click(source);

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('exchanges an overflow item when it is dropped on a visible row', () => {
    const onDropOverflow = vi.fn();
    renderNav({ onDropOverflow, overflowIds: ['site'] });
    const target = screen.getByRole('link', { name: 'Туры' });
    const dataTransfer = createDataTransfer('application/x-admin-sidebar-overflow', 'site');
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });

    expect(onDropOverflow).toHaveBeenCalledWith('site', 1);
  });

  it('uses the same reorder callback for keyboard movement and disables boundary actions', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    renderNav({ onReorder });

    const firstMoveUp = screen.getByRole('button', { name: `${ADMIN_UI.moveUp}: Обзор` });
    const firstMoveDown = screen.getByRole('button', { name: `${ADMIN_UI.moveDown}: Обзор` });
    const secondMoveUp = screen.getByRole('button', { name: `${ADMIN_UI.moveUp}: Туры` });
    const secondMoveDown = screen.getByRole('button', { name: `${ADMIN_UI.moveDown}: Туры` });
    expect(firstMoveUp).toBeDisabled();
    expect(secondMoveDown).toBeDisabled();
    await user.click(firstMoveDown);
    await user.click(secondMoveUp);

    expect(onReorder).toHaveBeenNthCalledWith(1, 0, 1);
    expect(onReorder).toHaveBeenNthCalledWith(2, 1, 0);
    expect(firstMoveUp).toHaveAttribute('aria-label', 'Выше: Обзор');
    expect(secondMoveDown).toHaveAttribute('aria-label', 'Ниже: Туры');
  });
});
