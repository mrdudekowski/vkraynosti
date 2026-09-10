import { describe, expect, it } from 'vitest';
import {
  readTourScheduleBootstrapPayload,
  serializeJsonForScriptTag,
  TOUR_SCHEDULE_BOOTSTRAP_ELEMENT_ID,
} from './tourScheduleBootstrap';

describe('tourScheduleBootstrap', () => {
  it('serializes JSON safely for script tags', () => {
    expect(serializeJsonForScriptTag({ note: '</script>' })).not.toContain('</script>');
  });

  it('reads bootstrap payload from DOM', () => {
    const payload = {
      events: [],
      catalogPrices: { 'spring-1': 6000 },
      catalogDurationTypes: { 'spring-1': 'однодневный' as const },
      catalogPublicationStatuses: { 'spring-1': 'active' as const },
    };

    document.body.innerHTML = `<script type="application/json" id="${TOUR_SCHEDULE_BOOTSTRAP_ELEMENT_ID}">${serializeJsonForScriptTag(payload)}</script>`;

    expect(readTourScheduleBootstrapPayload()).toEqual(payload);
  });
});
