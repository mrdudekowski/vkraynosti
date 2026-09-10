import {
  getCmsOverlayTourById,
  isCmsTourOverlayActive,
  listCmsOverlayTours,
} from '../cms/cmsTourOverlay';
import type { Tour } from '../types';
import { TOURS, getTourById } from './toursData';

/** Каталог витрины: CMS JSON, если overlay активен, иначе `toursData.ts`. */
export function getRuntimeTours(): readonly Tour[] {
  if (isCmsTourOverlayActive()) {
    return listCmsOverlayTours();
  }
  return TOURS;
}

export function getRuntimeTourById(id: string): Tour | undefined {
  if (isCmsTourOverlayActive()) {
    return getCmsOverlayTourById(id);
  }
  return getTourById(id);
}

export function getRuntimeToursBySeason(season: Tour['season']): Tour[] {
  return getRuntimeTours().filter((tour) => tour.season === season);
}
