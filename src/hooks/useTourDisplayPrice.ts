import type { Season } from '../types';
import { formatPriceRub } from '../utils/tourSchedule/formatPriceRub';
import { useTourSchedule } from './useTourSchedule';

export interface TourDisplayPriceSource {
  id: string;
  price: string;
  pricePrevious?: string;
  season: Season;
}

export interface TourDisplayPrice {
  priceRub: number | null;
  displayPrice: string;
  displayPricePrevious?: string;
}

export interface UseTourDisplayPriceOptions {
  /** По умолчанию true. При false — всегда `tour.price`, без цены из расписания. */
  preferCatalogPrice?: boolean;
}

export const useTourDisplayPrice = (
  tour: TourDisplayPriceSource,
  options?: UseTourDisplayPriceOptions
): TourDisplayPrice => {
  const preferCatalogPrice = options?.preferCatalogPrice !== false;
  const { prices } = useTourSchedule();
  const priceRub = preferCatalogPrice ? (prices.get(tour.id) ?? null) : null;

  if (priceRub != null) {
    return {
      priceRub,
      displayPrice: formatPriceRub(priceRub),
      displayPricePrevious: tour.pricePrevious,
    };
  }

  return {
    priceRub: null,
    displayPrice: tour.price,
    displayPricePrevious: tour.pricePrevious,
  };
};
