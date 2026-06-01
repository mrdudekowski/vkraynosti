import { useState } from 'react';

/**
 * Локальный месяц календаря выездов с синхронизацией при смене focusMonth из модели.
 */
export const useSyncedDepartureDisplayMonth = (focusMonth: Date) => {
  const focusMonthKey = focusMonth.getTime();
  const [displayMonth, setDisplayMonth] = useState(focusMonth);
  const [syncedFocusMonthKey, setSyncedFocusMonthKey] = useState(focusMonthKey);

  if (focusMonthKey !== syncedFocusMonthKey) {
    setSyncedFocusMonthKey(focusMonthKey);
    setDisplayMonth(focusMonth);
  }

  return [displayMonth, setDisplayMonth] as const;
};
