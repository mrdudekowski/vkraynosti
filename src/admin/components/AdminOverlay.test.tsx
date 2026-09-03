import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import AdminDataList from './AdminDataList';
import AdminDialog from './AdminDialog';
import AdminSheet from './AdminSheet';
import { AdminToastProvider } from './AdminToast';
import { useAdminToast } from '../toast/adminToastContext';

describe('AdminDataList', () => {
  it('рисует адаптивный ряд с заголовком и статусом', () => {
    render(
      <AdminDataList
        titleHeader="Элемент"
        statusHeader="Статус"
        items={[{ id: '1', title: 'Изюбриная', status: 'Черновик' }]}
      />,
    );
    expect(screen.getByText('Изюбриная')).toBeInTheDocument();
    expect(screen.getByText('Черновик')).toBeInTheDocument();
  });
});

describe('AdminSheet', () => {
  it('renders an explicit close control in its visible header', () => {
    render(
      <AdminSheet title="Проблемы" titleId="sheet-title" closeLabel="Закрыть" onClose={vi.fn()}>
        <p>Нет обложки</p>
      </AdminSheet>,
    );

    expect(screen.getAllByRole('button', { name: 'Закрыть' })).toHaveLength(2);
  });

  it('закрывается по кнопке оверлея', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminSheet title="Проблемы" titleId="sheet-title" closeLabel={ADMIN_UI.closeOverlay} onClose={onClose}>
        <p>Нет обложки</p>
      </AdminSheet>,
    );
    expect(screen.getByRole('dialog', { name: 'Проблемы' })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: ADMIN_UI.closeOverlay })[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('AdminDialog', () => {
  it('renders an explicit close control in its visible header', () => {
    render(
      <AdminDialog title="Редактор" titleId="dialog-title" closeLabel="Закрыть" onClose={vi.fn()}>
        <p>Содержимое</p>
      </AdminDialog>,
    );

    expect(screen.getAllByRole('button', { name: 'Закрыть' })).toHaveLength(2);
  });
});

const ToastProbe = () => {
  const { push } = useAdminToast();
  return (
    <button
      type="button"
      onClick={() =>
        push({
          message: 'Удалено',
          actionLabel: ADMIN_UI.undo,
          onAction: () => undefined,
        })
      }
    >
      toast
    </button>
  );
};

describe('AdminToast', () => {
  it('показывает сообщение и Undo', async () => {
    const user = userEvent.setup();
    render(
      <AdminToastProvider>
        <ToastProbe />
      </AdminToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'toast' }));
    expect(screen.getByText('Удалено')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.undo })).toBeInTheDocument();
  });
});
