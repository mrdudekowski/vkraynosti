import { describe, expect, it } from 'vitest';
import { useTourRequestModalSteps } from './useTourRequestModalSteps';

describe('useTourRequestModalSteps', () => {
  it('opens form without departure field when tour has no future departures', () => {
    expect(useTourRequestModalSteps({ futureDepartureCount: 0 })).toEqual({
      initialStep: 'form',
      requiresDepartureDate: false,
      showDepartureDateField: false,
      initialDepartureDateIso: '',
    });
  });

  it('ignores payload ISO when tour has no future departures', () => {
    expect(
      useTourRequestModalSteps({
        futureDepartureCount: 0,
        preferredDepartureDateIso: '2026-06-06',
      })
    ).toEqual({
      initialStep: 'form',
      requiresDepartureDate: false,
      showDepartureDateField: false,
      initialDepartureDateIso: '',
    });
  });

  it('opens form with sole departure auto-filled when count is 1 and no prefill', () => {
    expect(
      useTourRequestModalSteps({
        futureDepartureCount: 1,
        soleFutureDepartureDateIso: '2026-08-15',
      })
    ).toEqual({
      initialStep: 'form',
      requiresDepartureDate: true,
      showDepartureDateField: true,
      initialDepartureDateIso: '2026-08-15',
    });
  });

  it('opens form with payload ISO when count is 1 and prefill exists', () => {
    expect(
      useTourRequestModalSteps({
        futureDepartureCount: 1,
        preferredDepartureDateIso: '2026-09-01',
        soleFutureDepartureDateIso: '2026-08-15',
      })
    ).toEqual({
      initialStep: 'form',
      requiresDepartureDate: true,
      showDepartureDateField: true,
      initialDepartureDateIso: '2026-09-01',
    });
  });

  it('opens form when preferred departure date is already in payload', () => {
    expect(
      useTourRequestModalSteps({
        futureDepartureCount: 3,
        preferredDepartureDateIso: '2026-06-06',
      })
    ).toEqual({
      initialStep: 'form',
      requiresDepartureDate: true,
      showDepartureDateField: true,
      initialDepartureDateIso: '2026-06-06',
    });
  });

  it('opens date step when departures exist and no prefill', () => {
    expect(useTourRequestModalSteps({ futureDepartureCount: 2 })).toEqual({
      initialStep: 'date',
      requiresDepartureDate: true,
      showDepartureDateField: true,
      initialDepartureDateIso: '',
    });
  });
});
