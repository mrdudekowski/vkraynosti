const TOUR_ID_NUMERIC_SUFFIX = /^[a-z]+-(\d+)$/;

function numericSuffixSortKey(tourId: string): number {
  const match = TOUR_ID_NUMERIC_SUFFIX.exec(tourId);
  return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

/** Сортирует по `displayOrder`; id вне списка — после перечисленных, по числовому суффиксу. */
export function sortToursByDisplayOrder<T extends { id: string }>(
  tours: readonly T[],
  displayOrder: readonly string[],
): T[] {
  const orderIndex = new Map(displayOrder.map((id, index) => [id, index]));
  const unlistedBase = displayOrder.length;

  return [...tours].sort((a, b) => {
    const indexA = orderIndex.get(a.id);
    const indexB = orderIndex.get(b.id);
    const keyA = indexA ?? unlistedBase + numericSuffixSortKey(a.id);
    const keyB = indexB ?? unlistedBase + numericSuffixSortKey(b.id);
    return keyA - keyB;
  });
}
