/** ISO `YYYY-MM-DD` → локальная полночь (без сдвига UTC). */
export const parseIsoDate = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};
