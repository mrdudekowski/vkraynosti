import type { TourSchedulePayload } from '../../types/tourSchedule';

/** Injected by data-SSG at build time; read synchronously before React mounts. */
export const TOUR_SCHEDULE_BOOTSTRAP_ELEMENT_ID = 'tour-schedule-bootstrap';

export function readTourScheduleBootstrapPayload(): TourSchedulePayload | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const element = document.getElementById(TOUR_SCHEDULE_BOOTSTRAP_ELEMENT_ID);
  const raw = element?.textContent?.trim();
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as TourSchedulePayload;
    if (
      parsed == null ||
      !Array.isArray(parsed.events) ||
      typeof parsed.catalogPublicationStatuses !== 'object'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Safe for embedding in `<script type="application/json">`. */
export function serializeJsonForScriptTag(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
