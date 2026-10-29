export function moveItemToIndex<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }
  const next = [...items];
  const moved = next[fromIndex];
  if (moved === undefined) {
    return items;
  }
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }
  const next = [...items];
  const current = next[index];
  const swap = next[nextIndex];
  if (current == null || swap == null) {
    return items;
  }
  next[index] = swap;
  next[nextIndex] = current;
  return next;
}
