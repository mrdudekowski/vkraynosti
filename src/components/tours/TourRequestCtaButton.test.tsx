import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UI } from '../../constants/ui';
import TourRequestCtaButton from './TourRequestCtaButton';

describe('TourRequestCtaButton', () => {
  it('renders default CTA label', () => {
    render(<TourRequestCtaButton season="spring" onClick={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: UI.tourDetail.requestTourCta })
    ).toBeInTheDocument();
    expect(screen.getByText(UI.tourDetail.requestTourCta)).toHaveClass(
      'btn-cta-tour__default'
    );
  });

  it('renders BrandWordmark in hover layer with season styling', () => {
    render(<TourRequestCtaButton season="summer" onClick={vi.fn()} />);

    const firstLetter = screen.getByText('В');
    expect(firstLetter).toHaveClass('bg-season-chrome-text-summer');
    expect(firstLetter.closest('.font-brand-wordmark')).toHaveClass(
      'text-brand-wordmark-nav'
    );
    expect(screen.getByText('Крайности')).toHaveClass('text-text-inverse');
    expect(firstLetter.closest('.btn-cta-tour__hover')).toHaveAttribute(
      'aria-hidden'
    );
  });
});
