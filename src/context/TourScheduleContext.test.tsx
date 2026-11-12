import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TourScheduleProvider } from './TourScheduleContext';
import { useTourSchedule } from '../hooks/useTourSchedule';
import { loadTourSchedulePayload } from '../services/tourData';

vi.mock('../services/tourData', () => ({ loadTourSchedulePayload: vi.fn() }));
vi.mock('../utils/tourSchedule/tourScheduleBootstrap', () => ({
  readTourScheduleBootstrapPayload: () => null,
}));

function Probe() {
  const { prices, status } = useTourSchedule();
  return <output data-testid="schedule-value">{`${status}:${prices.get('fall-1') ?? ''}`}</output>;
}

const schedulePayload = (price: number) => ({
  events: [],
  catalogPrices: { 'fall-1': price },
  catalogDurationTypes: { 'fall-1': 'однодневный' as const },
  catalogPublicationStatuses: { 'fall-1': 'active' as const },
});

describe('TourScheduleProvider', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('refreshes live schedule data while the tab stays open', async () => {
    vi.useFakeTimers();
    vi.mocked(loadTourSchedulePayload)
      .mockResolvedValueOnce(schedulePayload(5_000))
      .mockResolvedValueOnce(schedulePayload(10_000));

    const { getByTestId } = render(<TourScheduleProvider><Probe /></TourScheduleProvider>);
    await act(async () => { await vi.advanceTimersByTimeAsync(10); });
    expect(getByTestId('schedule-value').textContent).toBe('success:5000');

    await act(async () => { await vi.advanceTimersByTimeAsync(6 * 60_000); });

    expect(getByTestId('schedule-value').textContent).toBe('success:10000');
    expect(loadTourSchedulePayload).toHaveBeenCalledTimes(2);
  });
});
