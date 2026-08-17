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
        heroPhrase=""
        duration=""
        difficulty="Medium"
        difficultyDisplayLabel=""
        metaAudienceLabel=""
        price=""
        pricePrevious=""
        priceFootnote=""
        seoDescription=""
        onChange={onChange}
      />,
    );

    await user.type(screen.getByLabelText(ADMIN_UI.priceLabel), '1');
    expect(onChange).toHaveBeenCalledWith({ price: '1' });
    await user.selectOptions(screen.getByLabelText(ADMIN_UI.difficultyLabel), 'Hard');
    expect(onChange).toHaveBeenCalledWith({ difficulty: 'Hard' });
  });
});
