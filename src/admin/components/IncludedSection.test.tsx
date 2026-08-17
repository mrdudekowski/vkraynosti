import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UNSET_INCLUDED_ICON_KEY } from '../../cms/includedIconCatalog';
import { ADMIN_UI } from '../constants/ui';
import IncludedSection from './IncludedSection';

describe('IncludedSection', () => {
  it('открывает пикер иконок как общий диалог и выбирает иконку', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <IncludedSection
        items={[{ text: 'Гид', iconKey: UNSET_INCLUDED_ICON_KEY }]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: ADMIN_UI.includedIconUnset }));
    expect(screen.getByRole('dialog', { name: ADMIN_UI.includedIconPickerTitle })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.iconLabels['user-tie'] }));
    expect(onChange).toHaveBeenCalledWith([{ text: 'Гид', iconKey: 'user-tie' }]);
    expect(screen.queryByRole('dialog', { name: ADMIN_UI.includedIconPickerTitle })).not.toBeInTheDocument();
  });
});
