import { render, screen } from '@testing-library/react';
import type { ComponentProps, CSSProperties } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { TOUR_DETAIL_HERO_OBJECT_POSITION_CLASS, TOUR_HERO_OBJECT_POSITION_CLASS } from '../../utils/mediaObjectPosition';
import TourDetailHero from './TourDetailHero';

const renderHero = (props: Partial<ComponentProps<typeof TourDetailHero>> = {}) =>
  render(
    <MemoryRouter>
      <TourDetailHero
        imageUrl="/cover.webp"
        imageAlt="Робинзонада"
        title="Робинзонада – Приморское Бали"
        subtitle="Два дня у моря"
        backLinkTo="/"
        backLinkSeason="summer"
        {...props}
      />
    </MemoryRouter>,
  );

describe('TourDetailHero', () => {
  it('вешает CMS-кадры hero / heroLg на рамку страницы тура', () => {
    const { container } = renderHero({
      heroImageObjectClassName: TOUR_HERO_OBJECT_POSITION_CLASS,
      heroObjectStyle: {
        ['--tour-hero-object-position']: '57% 51%',
        ['--tour-hero-object-position-lg']: '51% 50%',
      } as CSSProperties & Record<`--${string}`, string>,
    });

    const frame = container.querySelector(`.${TOUR_DETAIL_HERO_OBJECT_POSITION_CLASS}`);
    expect(frame).not.toBeNull();
    expect(frame).toHaveStyle({
      '--tour-hero-object-position': '57% 51%',
      '--tour-hero-object-position-lg': '51% 50%',
    });

    const image = screen.getByRole('img', { name: 'Робинзонада' });
    expect(image).not.toHaveClass('object-center');
    expect(image).not.toHaveClass('lg:object-tour-detail-hero-desktop');
    expect(image).not.toHaveClass(TOUR_HERO_OBJECT_POSITION_CLASS);
  });
});
