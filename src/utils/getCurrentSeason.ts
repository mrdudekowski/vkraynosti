import type { Season } from '../types';

export const getCurrentSeason = (date: Date = new Date()): Season => {
  const month = date.getMonth();

  if (month === 11 || month === 0 || month === 1) return 'winter';
  if (month >= 2 && month <= 4)                   return 'spring';
  if (month >= 5 && month <= 7)                   return 'summer';
  return 'fall';
};

