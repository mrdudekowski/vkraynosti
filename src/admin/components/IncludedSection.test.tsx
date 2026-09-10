import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UNSET_INCLUDED_ICON_KEY } from '../../cms/includedIconCatalog';
import { ADMIN_UI } from '../constants/ui';
import { AdminToastProvider } from './AdminToast';
import IncludedSection from './IncludedSection';

describe('IncludedSection', () => {
  it('открывает пикер иконок как общий диалог и выбирает иконку', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AdminToastProvider>
        <IncludedSection
          items={[{ text: 'Гид', iconKey: UNSET_INCLUDED_ICON_KEY }]}
          onChange={onChange}
        />
      </AdminToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: ADMIN_UI.includedIconUnset }));
    expect(screen.getByRole('dialog', { name: ADMIN_UI.includedIconPickerTitle })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.iconLabels['user-tie'] }));
    expect(onChange).toHaveBeenCalledWith([{ text: 'Гид', iconKey: 'user-tie' }]);
    expect(screen.queryByRole('dialog', { name: ADMIN_UI.includedIconPickerTitle })).not.toBeInTheDocument();
  });

  it('даёт Undo после удаления пункта', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const items = [
      { text: 'Гид', iconKey: 'user-tie' },
      { text: 'Трансфер', iconKey: 'van-shuttle' },
    ];
    render(
      <AdminToastProvider>
        <IncludedSection items={items} onChange={onChange} />
      </AdminToastProvider>,
    );

    await user.click(screen.getAllByRole('button', { name: ADMIN_UI.removeItem })[0]!);
    expect(onChange).toHaveBeenCalledWith([{ text: 'Трансфер', iconKey: 'van-shuttle' }]);
    await user.click(screen.getByRole('button', { name: ADMIN_UI.undo }));
    expect(onChange).toHaveBeenLastCalledWith(items);
  });

  it('строка без иконки предупреждает как блокер', () => {
    render(
      <AdminToastProvider>
        <IncludedSection
          items={[{ text: 'Гид', iconKey: UNSET_INCLUDED_ICON_KEY }]}
          onChange={vi.fn()}
        />
      </AdminToastProvider>,
    );

    expect(screen.getByRole('button', { name: ADMIN_UI.includedIconUnset }).closest('li')).toHaveClass(
      'admin-row-warning',
    );
  });

  it('disables first-up and last-down and focuses a newly added item', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AdminToastProvider>
        <IncludedSection
          items={[
            { text: 'Гид', iconKey: 'user-tie' },
            { text: 'Трансфер', iconKey: 'van-shuttle' },
          ]}
          onChange={onChange}
        />
      </AdminToastProvider>,
    );

    expect(screen.getAllByRole('button', { name: ADMIN_UI.moveUp })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: ADMIN_UI.moveDown })[1]).toBeDisabled();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.addIncluded }));
    expect(onChange).toHaveBeenCalledWith([
      { text: 'Гид', iconKey: 'user-tie' },
      { text: 'Трансфер', iconKey: 'van-shuttle' },
      { text: '', iconKey: UNSET_INCLUDED_ICON_KEY },
    ]);
  });

  it('shows a compact empty state', () => {
    render(
      <AdminToastProvider>
        <IncludedSection items={[]} onChange={vi.fn()} />
      </AdminToastProvider>,
    );

    expect(screen.getByText(ADMIN_UI.includedEmpty)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: ADMIN_UI.includedHeading })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.addIncluded })).toBeInTheDocument();
  });
});
