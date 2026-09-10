import { describe, expect, it } from 'vitest';
import { TOUR_HERO_OBJECT_POSITION_CLASS } from './mediaObjectPosition';
import { tourCardCoverImgProps, tourHeroObjectProps } from './tourCoverPresentation';

describe('tourCoverPresentation', () => {
  it('карточка из CMS перекрывает легаси-класс', () => {
    const props = tourCardCoverImgProps({
      id: 'spring-3',
      coverCrop: { card: { x: 20, y: 80 } },
    });
    expect(props.wrapperClassName).toBe('media-object-position');
    expect(props.imgClassName).toBeUndefined();
  });

  it('hero из CMS ставит CSS-переменные вместо токенов темы', () => {
    const props = tourHeroObjectProps({
      id: 'summer-7',
      coverCrop: { hero: { x: 50, y: 32 }, heroLg: { x: 50, y: 24 } },
    });
    expect(props.heroImageObjectClassName).toBe(TOUR_HERO_OBJECT_POSITION_CLASS);
    expect(props.style).toMatchObject({
      ['--tour-hero-object-position']: '50% 32%',
      ['--tour-hero-object-position-lg']: '50% 24%',
    });
  });

  it('без coverCrop оставляет легаси hero summer-7', () => {
    const props = tourHeroObjectProps({ id: 'summer-7' });
    expect(props.heroImageObjectClassName).toContain('object-tour-detail-hero-summer-7-cover');
  });
});
