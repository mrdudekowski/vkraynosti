import { fireEvent, render, screen } from '@testing-library/react';
import { LayoutDashboard, Map as MapIcon } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AdminNavItem } from '../constants/nav';
import { ADMIN_UI } from '../constants/ui';
import AdminSidebarOverflowDialog from './AdminSidebarOverflowDialog';

const items: AdminNavItem[] = [
  {
    id: 'site',
    to: '/site',
    label: 'Сайт',
    icon: LayoutDashboard,
    isActive: (pathname) => pathname.startsWith('/site'),
  },
  {
    id: 'leads',
    to: '/leads',
    label: 'Лиды',
    icon: MapIcon,
    isActive: (pathname) => pathname.startsWith('/leads'),
  },
];

function renderDialog(overrides: Partial<React.ComponentProps<typeof AdminSidebarOverflowDialog>> = {}) {
  const onClose = vi.fn();
  return {
    onClose,
    ...render(
      <MemoryRouter initialEntries={['/']}>
        <AdminSidebarOverflowDialog
        items={items}
        onClose={onClose}
        onNavigate={vi.fn()}
        onDropOnVisible={vi.fn()}
        onReset={vi.fn()}
        {...overrides}
        />
      </MemoryRouter>,
    ),
  };
}

describe('AdminSidebarOverflowDialog', () => {
  it('renders the overflow items and exchange guidance in the existing dialog', () => {
    renderDialog();

    expect(screen.getByRole('dialog', { name: ADMIN_UI.overflowNavTitle })).toBeInTheDocument();
    expect(screen.getByLabelText(`${ADMIN_UI.moreNav} (2)`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Сайт' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Лиды' })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.overflowNavDragHint)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.overflowNavReset })).toBeInTheDocument();
  });

  it('navigates when an overflow item is clicked', () => {
    const onNavigate = vi.fn();
    renderDialog({ onNavigate });

    fireEvent.click(screen.getByRole('link', { name: 'Сайт' }));

    expect(onNavigate).toHaveBeenCalledWith(items[0]);
  });

  it('closes through the close button, backdrop, and Escape', () => {
    const { onClose, unmount } = renderDialog();
    fireEvent.click(screen.getAllByRole('button', { name: ADMIN_UI.overflowNavClose })[1]!);
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
    const next = renderDialog();
    fireEvent.click(screen.getAllByRole('button', { name: ADMIN_UI.overflowNavClose })[0]!);
    expect(next.onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(next.onClose).toHaveBeenCalledTimes(2);
  });

  it('emits a runtime-safe overflow drag payload and supports an exchange callback', () => {
    const onDropOnVisible = vi.fn();
    renderDialog({ onDropOnVisible });
    const link = screen.getByRole('link', { name: 'Лиды' });
    const dataTransfer = {
      effectAllowed: '',
      setData: vi.fn(),
      getData: vi.fn(() => 'leads'),
      dropEffect: 'move',
    } as unknown as DataTransfer;

    fireEvent.dragStart(link, { dataTransfer });

    expect(dataTransfer.effectAllowed).toBe('move');
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'application/x-admin-sidebar-overflow',
      'leads',
    );
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'leads');

    fireEvent.dragEnd(link, { dataTransfer });

    expect(onDropOnVisible).toHaveBeenCalledWith('leads');
  });

  it('ignores a valid canonical ID that is not currently in overflow', () => {
    const onDropOnVisible = vi.fn();
    renderDialog({ onDropOnVisible });
    const link = screen.getByRole('link', { name: 'Лиды' });
    const dataTransfer = {
      getData: vi.fn(() => 'dashboard'),
      dropEffect: 'move',
    } as unknown as DataTransfer;

    fireEvent.dragEnd(link, { dataTransfer });

    expect(onDropOnVisible).not.toHaveBeenCalled();
  });

  it('resets the layout from the footer', () => {
    const onReset = vi.fn();
    renderDialog({ onReset });

    fireEvent.click(screen.getByRole('button', { name: ADMIN_UI.overflowNavReset }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('does not render a non-mouse exchange control', () => {
    renderDialog();

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Переместить .* в сайдбар/ })).not.toBeInTheDocument();
  });

  it('renders nothing when there are no overflow items', () => {
    const { container } = renderDialog({ items: [] });

    expect(container).toBeEmptyDOMElement();
  });
});
