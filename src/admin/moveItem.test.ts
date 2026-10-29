import { describe, expect, it } from 'vitest';
import { moveItemToIndex } from './moveItem';

describe('moveItemToIndex', () => {
  it('переносит элемент на указанный индекс', () => {
    expect(moveItemToIndex(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItemToIndex(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('оставляет тот же список, если перенос невозможен', () => {
    const items = ['a', 'b', 'c'];
    expect(moveItemToIndex(items, 1, 1)).toBe(items);
    expect(moveItemToIndex(items, -1, 0)).toBe(items);
    expect(moveItemToIndex(items, 0, 4)).toBe(items);
  });
});
