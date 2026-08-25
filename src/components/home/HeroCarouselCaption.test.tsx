import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UI } from '../../constants/ui';
import { HeroCarouselCaptionBody } from './HeroCarouselCaption';

describe('HeroCarouselCaptionBody', () => {
  it('рисует фразу и кнопку как на главной', () => {
    render(<HeroCarouselCaptionBody phrase="Сопки уходят в море" />);
    expect(screen.getByText('Сопки уходят в море')).toBeInTheDocument();
    expect(screen.getByText(UI.hero.viewTour)).toBeInTheDocument();
  });
});
