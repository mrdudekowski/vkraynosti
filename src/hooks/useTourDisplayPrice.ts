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

export const useTourDisplayPrice = (tour: TourDisplayPriceSource): TourDisplayPrice => {
  const { prices } = useTourSchedule();
  const priceRub = prices.get(tour.id) ?? null;

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
