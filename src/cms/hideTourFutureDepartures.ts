const OPEN_LEAD_STATUSES = ['new', 'in_progress', 'booked'] as const;

export type HideTourDeparture = {
  id: string;
  startsOn: string;
  status: 'planned' | 'open' | 'full' | 'cancelled' | 'completed';
};

export type HideTourLead = {
  tourId: string;
  date: string;
  status: string;
};

export function isFutureWorkDeparture(departure: HideTourDeparture, todayIso: string): boolean {
  return (
    departure.status !== 'completed' &&
    departure.status !== 'cancelled' &&
    departure.startsOn >= todayIso
  );
}

export function futureWorkDeparturesForHide(
  departures: readonly HideTourDeparture[],
  todayIso: string,
): HideTourDeparture[] {
  return departures.filter((departure) => isFutureWorkDeparture(departure, todayIso));
}

export function futureLeadsBlockingHide(
  leads: readonly HideTourLead[],
  tourId: string,
  todayIso: string,
): HideTourLead[] {
  return leads.filter(
    (lead) =>
      lead.tourId === tourId &&
      lead.date >= todayIso &&
      (OPEN_LEAD_STATUSES as readonly string[]).includes(lead.status),
  );
}

export type HideTourPublishCheck =
  | { ok: true; deleteIds: string[] }
  | { ok: false; error: 'future_departures_have_leads'; leadCount: number }
  | { ok: false; error: 'confirm_delete_future_departures'; departureCount: number };

export function checkHideTourPublish(input: {
  confirmDeleteFutureDepartures: boolean;
  departures: readonly HideTourDeparture[];
  leads: readonly HideTourLead[];
  tourId: string;
  todayIso: string;
}): HideTourPublishCheck {
  const future = futureWorkDeparturesForHide(input.departures, input.todayIso);
  if (future.length === 0) {
    return { ok: true, deleteIds: [] };
  }
  const blockingLeads = futureLeadsBlockingHide(input.leads, input.tourId, input.todayIso);
  if (blockingLeads.length > 0) {
    return { ok: false, error: 'future_departures_have_leads', leadCount: blockingLeads.length };
  }
  if (!input.confirmDeleteFutureDepartures) {
    return {
      ok: false,
      error: 'confirm_delete_future_departures',
      departureCount: future.length,
    };
  }
  return { ok: true, deleteIds: future.map((departure) => departure.id) };
}
