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
