import type { Season } from '../types';
import { formatTourDisplayPrice } from '../cms/tourPrice';

export interface TourDisplayPriceSource {
  id: string;
  price: string;
  priceFrom?: boolean;
  pricePrevious?: string;
  season: Season;
}

export interface TourDisplayPrice {
  displayPrice: string;
  displayPricePrevious?: string;
}

export const useTourDisplayPrice = (tour: TourDisplayPriceSource): TourDisplayPrice => ({
    displayPrice: formatTourDisplayPrice(tour.price, tour.priceFrom),
    displayPricePrevious: tour.pricePrevious,
});
