import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import AdminErrorState from './AdminErrorState';
import AdminSkeleton from './AdminSkeleton';
import AdminStatus from './AdminStatus';
import AdminStickyContextBar from './AdminStickyContextBar';

describe('AdminStatus', () => {
  it('primary — chip, secondary — текст', () => {
    const { rerender } = render(
      <AdminStatus level="primary" tone="success">
        На сайте
      </AdminStatus>,
    );
    expect(screen.getByText('На сайте')).toHaveClass('admin-badge-success');

    rerender(
      <AdminStatus level="secondary" tone="neutral">
        Скрыт
      </AdminStatus>,
    );
    expect(screen.getByText('Скрыт')).toHaveClass('text-text-muted');
  });
});

describe('AdminErrorState', () => {
  it('даёт повтор', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<AdminErrorState onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: ADMIN_UI.retry }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('AdminSkeleton', () => {
  it('помечает загрузку для скринридера', () => {
    render(<AdminSkeleton variant="list" />);
    expect(screen.getByRole('status', { name: ADMIN_UI.loading })).toBeInTheDocument();
  });
});

describe('AdminStickyContextBar', () => {
  it('показывает проблемы только если есть блокеры', async () => {
    const onShow = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminStickyContextBar
        entityState="Черновик"
        readiness="4/5 готово"
        blockerCount={2}
        primary={<button type="button">Сохранить</button>}
        onShowProblems={onShow}
      />,
    );
    expect(screen.getByText(`2 ${ADMIN_UI.blockersFew}`)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.showProblems }));
    expect(onShow).toHaveBeenCalledTimes(1);
  });

  it('explains a disabled publish action when blockers remain', () => {
    render(
      <AdminStickyContextBar
        entityState={ADMIN_UI.tourVisibility.draft}
        readiness="4/5 готово"
        blockerCount={1}
        disabledHint={ADMIN_UI.publishBlockers.tour_not_ready}
        primary={<button type="button">{ADMIN_UI.publish}</button>}
      />,
    );

    expect(screen.getByText(ADMIN_UI.tourVisibility.draft)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.blockersOne)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.publishBlockers.tour_not_ready)).toHaveAttribute(
      'id',
      'admin-sticky-disabled-hint',
    );
  });

  it('keeps published and draft save hints without a disabled explanation', () => {
    const { rerender } = render(
      <AdminStickyContextBar
        entityState={ADMIN_UI.tourVisibility.on_site}
        saveHint={ADMIN_UI.unpublishedChanges}
        primary={<button type="button">{ADMIN_UI.publish}</button>}
      />,
    );

    expect(screen.getByText(ADMIN_UI.unpublishedChanges)).toBeInTheDocument();
    expect(screen.queryByText(ADMIN_UI.publishBlockers.tour_not_ready)).not.toBeInTheDocument();

    rerender(
      <AdminStickyContextBar
        entityState={ADMIN_UI.tourVisibility.draft}
        saveHint={ADMIN_UI.autosaved}
        primary={<button type="button">{ADMIN_UI.inboxSubmit}</button>}
      />,
    );

    expect(screen.getByText(ADMIN_UI.autosaved)).toBeInTheDocument();
  });
});
