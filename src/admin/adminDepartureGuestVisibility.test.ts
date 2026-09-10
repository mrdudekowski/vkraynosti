import { describe, expect, it } from 'vitest';
import { guestWillSeeDeparture } from './adminDepartureGuestVisibility';

describe('guestWillSeeDeparture', () => {
  it('гость видит open/full/completed только у тура «на сайте»', () => {
    const onSite = { published: true, status: 'active' as const };
    expect(guestWillSeeDeparture({ tour: onSite, status: 'open' })).toBe(true);
    expect(guestWillSeeDeparture({ tour: onSite, status: 'full' })).toBe(true);
    expect(guestWillSeeDeparture({ tour: onSite, status: 'completed' })).toBe(true);
    expect(guestWillSeeDeparture({ tour: onSite, status: 'planned' })).toBe(false);
    expect(guestWillSeeDeparture({ tour: onSite, status: 'cancelled' })).toBe(false);
  });

  it('гость не видит даты черновика, скрытого и «в работе»', () => {
    expect(
      guestWillSeeDeparture({
        tour: { published: false, status: 'active' },
        status: 'open',
      }),
    ).toBe(false);
    expect(
      guestWillSeeDeparture({
        tour: { published: true, status: 'hidden' },
        status: 'open',
      }),
    ).toBe(false);
    expect(
      guestWillSeeDeparture({
        tour: { published: true, status: 'in_development' },
        status: 'open',
      }),
    ).toBe(false);
  });
});
