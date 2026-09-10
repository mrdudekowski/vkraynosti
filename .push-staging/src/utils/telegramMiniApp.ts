import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TELEGRAM_TOUR_DESCRIPTION_MAX_LENGTH } from '../constants/telegramMiniApp';
import { parseIsoDate } from './tourSchedule/parseIsoDate';

import type { Tour } from '../types';
import { getTourGalleryGridUrls } from './tourGalleryUrls';
import { isVideoAssetUrl } from './isVideoAssetUrl';

export const formatTourDepartureLabel = (iso: string | null | undefined): string | null => {
  if (iso == null || iso.trim().length === 0) {
    return null;
  }
  return format(parseIsoDate(iso), 'd MMMM', { locale: ru });
};

export const truncateTelegramTourDescription = (
  text: string,
  maxLength: number = TELEGRAM_TOUR_DESCRIPTION_MAX_LENGTH,
): string => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
};

/** Галерея Mini App: только фото; видео-слоты из сетки полностью пропускаются. */
export const getTelegramTourGalleryImageUrls = (
  tour: Pick<Tour, 'id' | 'galleryGridUrls' | 'galleryImages'>,
): string[] => {
  const seen = new Set<string>();
  const imageUrls: string[] = [];

  for (const url of getTourGalleryGridUrls(tour)) {
    if (isVideoAssetUrl(url)) {
      continue;
    }
    if (seen.has(url)) {
      continue;
    }
    seen.add(url);
    imageUrls.push(url);
  }

  return imageUrls;
};
