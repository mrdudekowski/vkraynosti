import { useMemo, useState } from 'react';
import type { Season } from '../../types';
import {
  adminCalendarSeason,
  adminCalendarSeasonFromIso,
  isCrossSeasonDeparture,
} from '../adminCalendarSeason';
import { ADMIN_UI } from '../constants/ui';
import { formatAdminCrossSeasonDepartureWarning } from '../formatAdminCopy';
import { DEFAULT_DEPARTURE_SEATS } from '../scheduleCalendar';
import AdminButton from './AdminButton';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminDialog from './AdminDialog';
import { AdminTextInput } from './AdminFields';
import AdminSeasonSwitcher from './AdminSeasonSwitcher';
import ScheduleTourPickCard from './ScheduleTourPickCard';

export type SchedulePickableTour = {
  id: string;
  title: string;
  season: Season;
  imageUrl?: string | null;
};

export type AddDepartureWizardComplete = {
  tourId: string;
  startsOn: string;
  seats: number;
};

type WizardStep = 'tour' | 'date' | 'seats';
type PendingAdvance = 'tour' | 'date' | 'submit';

type AddDepartureWizardProps = {
  pickableTours: SchedulePickableTour[];
  lockedTourId?: string;
  lockedStartsOn?: string;
  excludedTourIds?: readonly string[];
  onClose: () => void;
  onComplete: (input: AddDepartureWizardComplete) => void;
};

function firstStep(lockedTourId: string | undefined, lockedStartsOn: string | undefined): WizardStep {
  if (lockedTourId == null) {
    return 'tour';
  }
  if (lockedStartsOn == null) {
    return 'date';
  }
  return 'seats';
}

function defaultSeason(lockedStartsOn: string | undefined): Season {
  return lockedStartsOn != null ? adminCalendarSeasonFromIso(lockedStartsOn) : adminCalendarSeason();
}

const AddDepartureWizard = ({
  pickableTours,
  lockedTourId,
  lockedStartsOn,
  excludedTourIds = [],
  onClose,
  onComplete,
}: AddDepartureWizardProps) => {
  const eligibleTours = useMemo(
    () => pickableTours.filter((tour) => !excludedTourIds.includes(tour.id)),
    [excludedTourIds, pickableTours],
  );
  const initialSeason = defaultSeason(lockedStartsOn);
  const [step, setStep] = useState<WizardStep>(() => firstStep(lockedTourId, lockedStartsOn));
  const [seasonFilter, setSeasonFilter] = useState<Season>(() => initialSeason);
  const seasonTours = useMemo(
    () => eligibleTours.filter((tour) => tour.season === seasonFilter),
    [eligibleTours, seasonFilter],
  );
  const [tourId, setTourId] = useState(() => {
    if (lockedTourId != null) {
      return lockedTourId;
    }
    const inSeason = eligibleTours.filter((tour) => tour.season === initialSeason);
    return inSeason[0]?.id ?? eligibleTours[0]?.id ?? '';
  });
  const [startsOn, setStartsOn] = useState(lockedStartsOn ?? '');
  const [seats, setSeats] = useState(DEFAULT_DEPARTURE_SEATS);
  const [crossSeasonOpen, setCrossSeasonOpen] = useState(false);
  const [crossSeasonAcknowledged, setCrossSeasonAcknowledged] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState<PendingAdvance | null>(null);

  const selectedTour =
    eligibleTours.find((tour) => tour.id === tourId) ??
    pickableTours.find((tour) => tour.id === tourId);

  const effectiveStartsOn = lockedStartsOn ?? startsOn;

  const needsCrossSeasonConsent =
    !crossSeasonAcknowledged &&
    selectedTour != null &&
    /^\d{4}-\d{2}-\d{2}$/.test(effectiveStartsOn) &&
    isCrossSeasonDeparture(selectedTour.season, effectiveStartsOn);

  const crossSeasonWarning =
    selectedTour != null && /^\d{4}-\d{2}-\d{2}$/.test(effectiveStartsOn)
      ? formatAdminCrossSeasonDepartureWarning(
          selectedTour.title,
          selectedTour.season,
          adminCalendarSeasonFromIso(effectiveStartsOn),
        )
      : '';

  const advanceFromTour = () => {
    setStep(lockedStartsOn == null ? 'date' : 'seats');
  };

  const advanceFromDate = () => {
    setStep('seats');
  };

  const submitWizard = () => {
    if (tourId.length === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(startsOn) || seats < 1) {
      return;
    }
    onComplete({ tourId, startsOn, seats });
  };

  const requestAdvance = (target: PendingAdvance) => {
    if (needsCrossSeasonConsent) {
      setPendingAdvance(target);
      setCrossSeasonOpen(true);
      return;
    }
    if (target === 'tour') {
      advanceFromTour();
      return;
    }
    if (target === 'date') {
      advanceFromDate();
      return;
    }
    submitWizard();
  };

  const confirmCrossSeason = () => {
    setCrossSeasonAcknowledged(true);
    setCrossSeasonOpen(false);
    const target = pendingAdvance;
    setPendingAdvance(null);
    if (target === 'tour') {
      advanceFromTour();
      return;
    }
    if (target === 'date') {
      advanceFromDate();
      return;
    }
    if (target === 'submit') {
      submitWizard();
    }
  };

  const handleSeasonChange = (season: Season) => {
    setSeasonFilter(season);
    const nextTour = eligibleTours.find((tour) => tour.season === season);
    if (nextTour != null && lockedTourId == null) {
      setTourId(nextTour.id);
    }
  };

  return (
    <>
      <AdminDialog
        title={ADMIN_UI.scheduleWizardTitle}
        titleId="admin-add-departure-heading"
        closeLabel={ADMIN_UI.cancel}
        size="lg"
        onClose={onClose}
      >
        {step === 'tour' ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-text-primary">{ADMIN_UI.schedulePickTour}</span>
                {seasonTours.length > 0 ? (
                  <span className="text-xs text-text-muted">{seasonTours.length}</span>
                ) : null}
              </div>
              <AdminSeasonSwitcher value={seasonFilter} onChange={handleSeasonChange} />
            </div>
            {seasonTours.length === 0 ? (
              <p className="text-sm text-text-muted">{ADMIN_UI.scheduleNoOnSiteTours}</p>
            ) : (
              <ul className="admin-editor-list flex flex-col gap-1">
                {seasonTours.map((tour) => (
                  <li key={tour.id} className="min-w-0">
                    <ScheduleTourPickCard
                      title={tour.title}
                      imageUrl={tour.imageUrl}
                      selected={tour.id === tourId}
                      onSelect={() => setTourId(tour.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
            {eligibleTours.length === 0 ? (
              <p className="text-sm text-text-muted">{ADMIN_UI.scheduleNoToursForDate}</p>
            ) : null}
            <AdminButton onClick={() => requestAdvance('tour')} disabled={tourId.length === 0}>
              {ADMIN_UI.scheduleWizardNext}
            </AdminButton>
          </div>
        ) : null}
        {step === 'date' ? (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-primary">{ADMIN_UI.schedulePickDate}</span>
              <AdminTextInput
                type="date"
                value={startsOn}
                onChange={(event) => setStartsOn(event.target.value)}
              />
            </label>
            <AdminButton
              onClick={() => requestAdvance('date')}
              disabled={!/^\d{4}-\d{2}-\d{2}$/.test(startsOn)}
            >
              {ADMIN_UI.scheduleWizardNext}
            </AdminButton>
          </div>
        ) : null}
        {step === 'seats' ? (
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              requestAdvance('submit');
            }}
          >
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-primary">{ADMIN_UI.scheduleSeats}</span>
              <AdminTextInput
                type="number"
                min={1}
                value={seats}
                onChange={(event) => setSeats(Number(event.target.value))}
              />
            </label>
            <AdminButton type="submit">{ADMIN_UI.scheduleWizardSubmit}</AdminButton>
          </form>
        ) : null}
      </AdminDialog>
      {crossSeasonOpen ? (
        <AdminConfirmDialog
          title={ADMIN_UI.scheduleCrossSeasonTitle}
          description={crossSeasonWarning}
          confirmLabel={ADMIN_UI.scheduleCrossSeasonConfirm}
          onConfirm={confirmCrossSeason}
          onClose={() => {
            setCrossSeasonOpen(false);
            setPendingAdvance(null);
          }}
        />
      ) : null}
    </>
  );
};

export default AddDepartureWizard;
