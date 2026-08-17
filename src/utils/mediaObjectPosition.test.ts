import { describe, expect, it } from 'vitest';
import {
  formatMediaFocalPoint,
  parseMediaFocalPoint,
  resolveMediaObjectPosition,
} from './mediaObjectPosition';

describe('parseMediaFocalPoint', () => {
  it('читает проценты', () => {
    expect(parseMediaFocalPoint('50% 40%')).toEqual({ x: 50, y: 40 });
    expect(parseMediaFocalPoint('12.5% 80%')).toEqual({ x: 12.5, y: 80 });
  });

  it('читает ключевые слова', () => {
    expect(parseMediaFocalPoint('center 62%')).toEqual({ x: 50, y: 62 });
    expect(parseMediaFocalPoint('left top')).toEqual({ x: 0, y: 0 });
  });

  it('не трогает Tailwind-класс', () => {
    expect(parseMediaFocalPoint('object-gallery-winter-rest4')).toBeNull();
  });
});

describe('formatMediaFocalPoint', () => {
  it('собирает CSS object-position', () => {
    expect(formatMediaFocalPoint({ x: 50, y: 40 })).toBe('50% 40%');
  });
});

describe('resolveMediaObjectPosition', () => {
  it('отдаёт CSS-значение для процентов и класс для object-*', () => {
    expect(resolveMediaObjectPosition('50% 40%')).toEqual({ objectPosition: '50% 40%' });
    expect(resolveMediaObjectPosition('object-gallery-winter-rest4')).toEqual({
      className: 'object-gallery-winter-rest4',
    });
    expect(resolveMediaObjectPosition(undefined)).toEqual({});
  });
});
