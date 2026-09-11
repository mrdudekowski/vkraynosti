import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import TourCatalogFields from './TourCatalogFields';

describe('TourCatalogFields', () => {
  it('отдаёт правки цены и сложности', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TourCatalogFields
        subtitle=""
        durationDays={undefined}
        difficulty="Medium"
        difficultyDisplayLabel=""
        metaAudienceLabel=""
        price=""
        priceFrom={false}
        pricePrevious=""
        priceFootnote=""
        seoDescription=""
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('heading', { name: ADMIN_UI.catalogHeading })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.catalogExtrasHeading)).toBeInTheDocument();

    await user.type(screen.getByLabelText(ADMIN_UI.priceLabel), '1');
    expect(onChange).toHaveBeenCalledWith({ price: '1' });
    await user.selectOptions(screen.getByLabelText(ADMIN_UI.difficultyLabel), 'Hard');
    expect(onChange).toHaveBeenCalledWith({ difficulty: 'Hard' });
    await user.selectOptions(screen.getByLabelText(ADMIN_UI.durationLabel), '2');
    expect(onChange).toHaveBeenCalledWith({ durationDays: 2 });
  });

  it('показывает чекбокс от только для числовой цены и нормализует суффикс', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <TourCatalogFields
        subtitle=""
        durationDays={undefined}
        difficulty="Medium"
        difficultyDisplayLabel=""
        metaAudienceLabel=""
        price="5000"
        priceFrom={false}
        pricePrevious=""
        priceFootnote=""
        seoDescription=""
        onChange={onChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'от' });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(onChange).toHaveBeenCalledWith({ priceFrom: true });

    const priceInput = screen.getByLabelText(ADMIN_UI.priceLabel);
    await user.click(priceInput);
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith({ price: '5000 ₽', priceFrom: false });

    rerender(
      <TourCatalogFields
        subtitle=""
        durationDays={undefined}
        difficulty="Medium"
        difficultyDisplayLabel=""
        metaAudienceLabel=""
        price="по запросу"
        priceFrom={true}
        pricePrevious=""
        priceFootnote=""
        seoDescription=""
        onChange={onChange}
      />,
    );
    expect(screen.queryByRole('checkbox', { name: 'от' })).not.toBeInTheDocument();
  });
});
