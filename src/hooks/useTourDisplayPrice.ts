import type { Season } from '../types';

export interface TourDisplayPriceSource {
  id: string;
  price: string;
  pricePrevious?: string;
  season: Season;
}

export interface TourDisplayPrice {
  displayPrice: string;
  displayPricePrevious?: string;
}

export const useTourDisplayPrice = (tour: TourDisplayPriceSource): TourDisplayPrice => ({
    displayPrice: tour.price,
    displayPricePrevious: tour.pricePrevious,
});
