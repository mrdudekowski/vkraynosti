import { describe, expect, it } from 'vitest';
import type { Tour } from '../types';
import { sortToursInDevelopmentLast } from './sortToursInDevelopmentLast';

const tour = (id: string, inDevelopment?: boolean): Tour =>
  ({
    id,
    season: 'summer',
    title: id,
    subtitle: '',
    heroPhrase: id,
    duration: '1 день',
    difficulty: 'Easy',
    price: 'по запросу',
    description: '',
    program: [],
    includedInPrice: [],
    imageUrl: '/x.webp',
    galleryImages: [],
    inDevelopment,
  }) as Tour;

describe('sortToursInDevelopmentLast', () => {
  it('moves inDevelopment tours to the end while preserving relative order', () => {
    const input = [
      tour('summer-13', true),
      tour('summer-1'),
      tour('summer-14', true),
      tour('summer-2'),
    ];

    expect(
      sortToursInDevelopmentLast(input, new Map([['summer-13', 'in_development'], ['summer-14', 'in_development']])).map(
        (item) => item.id,
      ),
    ).toEqual([
      'summer-1',
      'summer-2',
      'summer-13',
      'summer-14',
    ]);
  });
});
