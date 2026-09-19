import { moveItem } from './moveItem';

export function withOrder<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, order) => ({ ...item, order }));
}

export function sortedByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.order - right.order);
}

export function moveOrdered<T extends { order: number }>(
  items: T[],
  index: number,
  direction: -1 | 1,
): T[] {
  return withOrder(moveItem(sortedByOrder(items), index, direction));
}
