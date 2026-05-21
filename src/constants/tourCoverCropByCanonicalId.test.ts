import { describe, expect, it } from 'vitest';
import { TOUR_SPRING_3_COVER_CARD_IMG_OBJECT_CLASS } from './tourSpring3CoverCrop';
import { TOUR_SPRING_6_COVER_CARD_IMG_OBJECT_CLASS } from './tourSpring6CoverCrop';
import { getTourCoverCardImgObjectClass } from './tourCoverCropByCanonicalId';

describe('getTourCoverCardImgObjectClass', () => {
  it('spring-3 — класс карточки; fall-3 — свой id без alias', () => {
    expect(getTourCoverCardImgObjectClass('spring-3')).toBe(
      TOUR_SPRING_3_COVER_CARD_IMG_OBJECT_CLASS
    );
    expect(getTourCoverCardImgObjectClass('fall-3')).toBeUndefined();
  });

  it('spring-6 — класс карточки', () => {
    expect(getTourCoverCardImgObjectClass('spring-6')).toBe(
      TOUR_SPRING_6_COVER_CARD_IMG_OBJECT_CLASS
    );
  });

  it('неизвестный id — undefined', () => {
    expect(getTourCoverCardImgObjectClass('winter-1')).toBeUndefined();
  });
});
