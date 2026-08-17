import type { Tour } from '../types';
import { resolveTourWithCmsOverlay } from './cmsDocumentToSiteTour';

let overlayById: Map<string, Tour> = new Map();
let overlayActive = false;

export function isCmsTourOverlayActive(): boolean {
  return overlayActive;
}

export function setCmsTourOverlay(tours: readonly Tour[]): void {
  overlayById = new Map(tours.map((tour) => [tour.id, tour]));
  overlayActive = true;
}

export function clearCmsTourOverlay(): void {
  overlayById = new Map();
  overlayActive = false;
}

export function listCmsOverlayTours(): Tour[] {
  return [...overlayById.values()];
}

export function getCmsOverlayTourById(id: string): Tour | undefined {
  return overlayById.get(id);
}

export function applyCmsTourOverlay(codeTour: Tour | undefined): Tour | undefined {
  if (overlayActive) {
    return codeTour == null ? undefined : overlayById.get(codeTour.id);
  }
  return resolveTourWithCmsOverlay(codeTour, overlayById);
}

export { resolveTourWithCmsOverlay };
