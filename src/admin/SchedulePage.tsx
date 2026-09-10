import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ADMIN_SCHEDULE_MODE_STORAGE_KEY, ADMIN_SCHEDULE_WEEK_LAYOUT_STORAGE_KEY } from '../constants/adminUiTokens';
import { nearestDepartureDays } from '../cms/homeDepartures';
import type { AdminDeparture, AdminEditableDepartureStatus, AdminSession, AdminTourListItem } from './api';
import {
  adminCreateDeparture,
  adminDeleteDeparture,
  adminPublishAllEligibleDepartures,
  adminSubmitPublishQueue,
  adminUpdateDeparture,
} from './api';
import {
  getAdminDepartures,
  getAdminTours,
  invalidateAdminDepartures,
  invalidateAdminPublishQueue,
  peekAdminDepartures,
  peekAdminTours,
  refreshAdminDepartures,
  refreshAdminTours,
} from './adminDataCache';
import { ADMIN_UI } from './constants/ui';
import { listSchedulePickableTours } from './schedulePickableTours';
import AddDepartureWizard, {
  type AddDepartureWizardComplete,
} from './components/AddDepartureWizard';
import CancelDepartureDialog from './components/CancelDepartureDialog';
import AdminAlert from './components/AdminAlert';
import AdminButton from './components/AdminButton';
import AdminConfirmDialog from './components/AdminConfirmDialog';
import AdminErrorState from './components/AdminErrorState';
import AdminDisabledHint from './components/AdminDisabledHint';
import { AdminTextInput } from './components/AdminFields';
import AdminPageFrame from './components/AdminPageFrame';
import AdminPageHeader from './components/AdminPageHeader';
import AdminSelect from './components/AdminSelect';
import AdminSheet from './components/AdminSheet';
import AdminSkeleton from './components/AdminSkeleton';
import ScheduleCalendarToolbar from './components/ScheduleCalendarToolbar';
import ScheduleDayDeparturesDialog from './components/ScheduleDayDeparturesDialog';
import ScheduleMonthGrid from './components/ScheduleMonthGrid';
import ScheduleOperationalRail from './components/ScheduleOperationalRail';
import ScheduleReferenceTopBar from './components/ScheduleReferenceTopBar';
import ScheduleWeekListLayout from './components/ScheduleWeekListLayout';
import ScheduleWeekSplitLayout from './components/ScheduleWeekSplitLayout';
import type { DepartureQuickStatus } from './departureQuickStatus';
import { useAdminStoredState } from './hooks/useAdminStoredState';
import { useAdminViewport } from './hooks/useAdminViewport';
import { useAdminToast } from './toast/adminToastContext';
import { pushAdminUndo } from './toast/pushAdminUndo';
import {
  DEFAULT_DEPARTURE_SEATS,
  defaultScheduleMode,
  isScheduleMode,
  SCHEDULE_CELL_VISIBLE_DEPARTURES,
  scheduleVisibleDays,
  shiftScheduleCursor,
  vladivostokCalendarDate,
} from './scheduleCalendar';
import {
  defaultSelectedDayInWeek,
  isScheduleWeekLayout,
} from './scheduleWeekLayout';

const EDITABLE_STATUSES: readonly AdminEditableDepartureStatus[] = [
  'planned',
  'open',
  'full',
  'cancelled',
];

function isEditableStatus(value: string): value is AdminEditableDepartureStatus {
  return (EDITABLE_STATUSES as readonly string[]).includes(value);
}

function activeOnDate(
  departures: AdminDeparture[],
  tourId: string,
  startsOn: string,
): AdminDeparture | undefined {
  return departures.find(
    (departure) =>
      departure.tourId === tourId &&
      departure.startsOn === startsOn &&
      departure.status !== 'cancelled',
  );
}

type WizardState = {
  lockedTourId?: string;
  lockedStartsOn?: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type DepartureEditorSheetProps = {
  departure: AdminDeparture;
  onChange: (next: AdminDeparture) => void;
  onRequestCancel: () => void;
  onRequestDelete: () => void;
  onClose: () => void;
  onSave: () => void;
};

const DepartureEditorSheet = ({
  departure,
  onChange,
  onRequestCancel,
  onRequestDelete,
  onClose,
  onSave,
}: DepartureEditorSheetProps) => (
  <AdminSheet
    title={ADMIN_UI.scheduleEditorTitle}
    titleId="admin-departure-editor-heading"
    closeLabel={ADMIN_UI.cancel}
    onClose={onClose}
  >
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.schedulePickDate}</span>
        <AdminTextInput
          type="date"
          value={departure.startsOn}
          onChange={(event) => onChange({ ...departure, startsOn: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.scheduleSeats}</span>
        <AdminTextInput
          type="number"
          min={1}
          value={departure.seats}
          onChange={(event) =>
            onChange({
              ...departure,
              seats: Number(event.target.value) || DEFAULT_DEPARTURE_SEATS,
            })
          }
        />
      </label>
      {departure.status !== 'completed' ? (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.scheduleStatus}</span>
          <AdminSelect
            value={departure.status}
            onChange={(event) => {
              const value = event.target.value;
              if (!isEditableStatus(value)) {
                return;
              }
              if (value === 'cancelled' && departure.status !== 'cancelled') {
                onRequestCancel();
                return;
              }
              onChange({ ...departure, status: value });
            }}
          >
            {EDITABLE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ADMIN_UI.departureStatus[status]}
              </option>
            ))}
          </AdminSelect>
        </label>
      ) : null}
      <AdminButton type="submit">{ADMIN_UI.save}</AdminButton>
      {departure.status !== 'completed' && departure.publishedAt == null ? (
        <AdminButton type="button" variant="destructive" onClick={onRequestDelete}>
          {ADMIN_UI.scheduleDelete}
        </AdminButton>
      ) : null}
    </form>
  </AdminSheet>
);

const SchedulePage = () => {
  const { session } = useOutletContext<{ session: AdminSession }>();
  const { push } = useAdminToast();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const departureParam = searchParams.get('departure');
  const viewport = useAdminViewport();
  const [storedMode, setMode] = useAdminStoredState(ADMIN_SCHEDULE_MODE_STORAGE_KEY, isScheduleMode);
  const [storedWeekLayout, setWeekLayout] = useAdminStoredState(
    ADMIN_SCHEDULE_WEEK_LAYOUT_STORAGE_KEY,
    isScheduleWeekLayout,
  );
  const mode = storedMode ?? defaultScheduleMode(viewport);
  const weekLayout = storedWeekLayout ?? 'list';
  const monthGrid = mode === 'month' && viewport !== 'mobile';
  const weekSplitDesktop = mode === 'week' && weekLayout === 'split' && viewport === 'desktop';
  const sectionScroll = mode !== 'month';
  const showRail = !monthGrid && !weekSplitDesktop;
  const [cursorIso, setCursorIso] = useState(() =>
    dateParam != null && ISO_DATE.test(dateParam) ? dateParam : vladivostokCalendarDate(),
  );
  const visibleDays = useMemo(() => scheduleVisibleDays(mode, cursorIso), [mode, cursorIso]);
  const from = visibleDays[0] ?? cursorIso;
  const to = visibleDays[visibleDays.length - 1] ?? cursorIso;
  const departureRange = useMemo(() => ({ from, to }), [from, to]);
  const cachedTours = peekAdminTours();
  const [departures, setDepartures] = useState<AdminDeparture[]>(
    () => peekAdminDepartures(departureRange) ?? [],
  );
  const [tourTitles, setTourTitles] = useState<Record<string, string>>(
    () => Object.fromEntries((cachedTours ?? []).map((tour) => [tour.id, tour.title])),
  );
  const [tourImageUrls, setTourImageUrls] = useState<Record<string, string | null>>(
    () => Object.fromEntries((cachedTours ?? []).map((tour) => [tour.id, tour.imageUrl])),
  );
  const [toursById, setToursById] = useState<Record<string, AdminTourListItem>>(
    () => Object.fromEntries((cachedTours ?? []).map((tour) => [tour.id, tour])),
  );
  const [pickableTours, setPickableTours] = useState(() => listSchedulePickableTours(cachedTours ?? []));
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(
    () => cachedTours != null && peekAdminDepartures(departureRange) != null,
  );
  const [wizard, setWizard] = useState<WizardState | null>(null);
  const [stackIso, setStackIso] = useState<string | null>(null);
  const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminDeparture | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminDeparture | null>(null);
  const [busy, setBusy] = useState(false);
  const openedFromQuery = useRef(false);
  const todayIso = vladivostokCalendarDate();
  const weekSelectedIso = useMemo(() => {
    if (mode !== 'week') {
      return selectedDayIso;
    }
    if (selectedDayIso != null && visibleDays.includes(selectedDayIso)) {
      return selectedDayIso;
    }
    return defaultSelectedDayInWeek(
      visibleDays,
      todayIso,
      new Set(departures.map((departure) => departure.startsOn)),
    );
  }, [departures, mode, selectedDayIso, todayIso, visibleDays]);

  const reload = useCallback(async (forceRefresh = false) => {
    try {
      const [nextDepartures, listed] = await Promise.all([
        forceRefresh ? refreshAdminDepartures(departureRange) : getAdminDepartures(departureRange),
        forceRefresh ? refreshAdminTours() : getAdminTours(),
      ]);
      const nextPickable = listSchedulePickableTours(listed);
      setDepartures(nextDepartures);
      setPickableTours(nextPickable);
      setTourTitles(Object.fromEntries(listed.map((tour) => [tour.id, tour.title])));
      setTourImageUrls(Object.fromEntries(listed.map((tour) => [tour.id, tour.imageUrl])));
      setToursById(Object.fromEntries(listed.map((tour) => [tour.id, tour])));
      setError(null);
    } catch {
      setError(ADMIN_UI.scheduleLoadError);
    } finally {
      setLoaded(true);
    }
  }, [departureRange]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (mode !== 'week' || weekSelectedIso == null) {
      return;
    }
    if (selectedDayIso !== weekSelectedIso) {
      setSelectedDayIso(weekSelectedIso);
    }
  }, [mode, selectedDayIso, weekSelectedIso]);

  useEffect(() => {
    if (!sectionScroll) {
      delete window.document.body.dataset.adminScheduleSections;
      return;
    }
    window.document.body.dataset.adminScheduleSections = 'true';
    return () => {
      delete window.document.body.dataset.adminScheduleSections;
    };
  }, [sectionScroll]);

  useEffect(() => {
    if (openedFromQuery.current || departureParam == null) {
      return;
    }
    const found = departures.find((item) => item.id === departureParam);
    if (found == null) {
      return;
    }
    openedFromQuery.current = true;
    setWizard(null);
    setStackIso(null);
    setEditing(found);
  }, [departures, departureParam]);

  const openWizardForCell = (iso: string) => {
    setStackIso(null);
    setEditing(null);
    setSelectedDayIso(iso);
    setWizard({ lockedStartsOn: iso });
  };

  const openExisting = (departure: AdminDeparture) => {
    setWizard(null);
    setStackIso(null);
    setSelectedDayIso(departure.startsOn);
    setEditing(departure);
  };

  const onCellActivate = (iso: string) => {
    setSelectedDayIso(iso);
    const chips = departures.filter((departure) => departure.startsOn === iso);
    if (chips.length === 0) {
      openWizardForCell(iso);
      return;
    }
    if (chips.length === 1 && chips[0] != null) {
      openExisting(chips[0]);
      return;
    }
    setEditing(null);
    setStackIso(iso);
  };

  const openDayDetail = (iso: string) => {
    setSelectedDayIso(iso);
    setEditing(null);
    setStackIso(iso);
  };

  const onSelectWeekDay = (iso: string) => {
    setSelectedDayIso(iso);
    if (weekLayout === 'split' && viewport !== 'desktop') {
      setEditing(null);
      setStackIso(iso);
    }
  };

  const openDepartureFromMonth = (departure: AdminDeparture, iso: string, totalOnDay: number) => {
    setSelectedDayIso(iso);
    if (totalOnDay === 1) {
      openExisting(departure);
      return;
    }
    setEditing(null);
    setStackIso(iso);
  };

  const finishWizard = async (input: AddDepartureWizardComplete) => {
    const existing = activeOnDate(departures, input.tourId, input.startsOn);
    if (existing != null) {
      setWizard(null);
      openExisting(existing);
      return;
    }
    try {
      const created = await adminCreateDeparture({
        tourId: input.tourId,
        startsOn: input.startsOn,
        seats: input.seats,
      });
      setWizard(null);
      setDepartures((current) => [...current, created]);
      invalidateAdminDepartures();
      invalidateAdminPublishQueue();
      setError(null);
    } catch {
      setError(ADMIN_UI.scheduleSaveError);
    }
  };

  const replaceDeparture = (updated: AdminDeparture) => {
    setDepartures((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setEditing((current) => (current?.id === updated.id ? updated : current));
    invalidateAdminDepartures();
    invalidateAdminPublishQueue();
  };

  const saveEditor = async () => {
    if (editing == null || editing.status === 'completed') {
      return;
    }
    try {
      const updated = await adminUpdateDeparture(editing.id, {
        version: editing.version,
        startsOn: editing.startsOn,
        seats: editing.seats,
        status: editing.status,
      });
      setEditing(null);
      replaceDeparture(updated);
      setError(null);
    } catch {
      setError(ADMIN_UI.scheduleSaveError);
    }
  };

  const changeQuickStatus = async (departure: AdminDeparture, status: DepartureQuickStatus) => {
    if (departure.status === status) {
      return;
    }
    try {
      const updated = await adminUpdateDeparture(departure.id, {
        version: departure.version,
        status,
      });
      replaceDeparture(updated);
      setError(null);
    } catch {
      setError(ADMIN_UI.scheduleSaveError);
    }
  };

    const requestDeleteEditor = () => {
    if (editing == null || editing.status === 'completed' || editing.publishedAt != null) {
      return;
    }
    setPendingDelete(editing);
    setEditing(null);
  };

  const deletePending = async () => {
    if (pendingDelete == null || pendingDelete.status === 'completed') {
      return;
    }
    const departureId = pendingDelete.id;
    try {
      await adminDeleteDeparture(departureId);
      setPendingDelete(null);
      setDepartures((current) => current.filter((item) => item.id !== departureId));
      invalidateAdminDepartures();
      invalidateAdminPublishQueue();
      push({ message: ADMIN_UI.scheduleDeleted });
      setError(null);
    } catch {
      setPendingDelete(null);
      setError(ADMIN_UI.scheduleDeleteError);
      push({ message: ADMIN_UI.scheduleDeleteError });
    }
  };

  const onDropChip = async (departureId: string, startsOn: string) => {
    const departure = departures.find((item) => item.id === departureId);
    if (departure == null || departure.startsOn === startsOn || departure.status === 'completed') {
      return;
    }
    const previousStartsOn = departure.startsOn;
    try {
      const updated = await adminUpdateDeparture(departure.id, {
        version: departure.version,
        startsOn,
      });
      setDepartures((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      invalidateAdminDepartures();
      invalidateAdminPublishQueue();
      pushAdminUndo(push, ADMIN_UI.scheduleMoved, () => {
        void adminUpdateDeparture(updated.id, {
          version: updated.version,
          startsOn: previousStartsOn,
        })
          .then((rolled) => {
            setDepartures((current) =>
              current.map((item) => (item.id === rolled.id ? rolled : item)),
            );
            invalidateAdminDepartures();
            invalidateAdminPublishQueue();
          })
          .catch(() => setError(ADMIN_UI.scheduleSaveError));
      });
    } catch {
      setError(ADMIN_UI.scheduleSaveError);
    }
  };

  const hasPublishedTours = Object.values(toursById).some((tour) => tour.published);
  const publishDisabledReason =
    !hasPublishedTours ? ADMIN_UI.scheduleNoPublishableDepartures : null;

  const onSubmitSchedule = async () => {
    setBusy(true);
    try {
      await adminSubmitPublishQueue({ departureIds: departures.map((departure) => departure.id) });
      invalidateAdminPublishQueue();
      setError(null);
    } catch {
      setError(ADMIN_UI.inboxSubmitError);
    } finally {
      setBusy(false);
    }
  };

  const onPublishSchedule = async () => {
    if (publishDisabledReason != null) {
      return;
    }
    setBusy(true);
    try {
      await adminPublishAllEligibleDepartures();
      invalidateAdminDepartures();
      invalidateAdminPublishQueue();
      setError(null);
    } catch {
      setError(ADMIN_UI.publishError);
    } finally {
      setBusy(false);
    }
  };

  const loadFailed = loaded && error === ADMIN_UI.scheduleLoadError && departures.length === 0;
  const nearestRailDepartures = useMemo(
    () =>
      nearestDepartureDays(departures, todayIso)
        .flatMap((day) => departures.filter((departure) => departure.startsOn === day))
        .filter((departure) => departure.status !== 'completed')
        .slice(0, 7),
    [departures, todayIso],
  );

  const visibleDepartureCount = departures.filter((departure) => departure.status !== 'completed').length;

  return (
    <AdminPageFrame variant="wide" className={sectionScroll ? 'admin-schedule-section-frame' : undefined}>
      <ScheduleReferenceTopBar />
      <div className={sectionScroll ? 'admin-schedule-section-stack' : 'flex flex-col gap-5'}>
        <AdminPageHeader
        title={ADMIN_UI.scheduleTitle}
        description={monthGrid ? undefined : ADMIN_UI.scheduleMoveHint}
        action={
          <AdminButton type="button" onClick={() => setWizard({})}>
            {ADMIN_UI.scheduleAdd}
          </AdminButton>
        }
        secondary={
          session.canPublishSchedule ? (
            <AdminButton
              variant="secondary"
              disabled={busy || publishDisabledReason != null}
              aria-describedby={publishDisabledReason != null ? 'schedule-publish-hint' : undefined}
              onClick={() => void onPublishSchedule()}
            >
              {ADMIN_UI.publishSchedule}
            </AdminButton>
          ) : (
            <AdminButton
              variant="secondary"
              disabled={busy || departures.length === 0}
              onClick={() => void onSubmitSchedule()}
            >
              {busy ? ADMIN_UI.inboxSubmitting : ADMIN_UI.inboxSubmit}
            </AdminButton>
          )
        }
        />
        <div
          className={`grid min-w-0 gap-5 ${monthGrid || weekSplitDesktop ? '' : 'xl:grid-cols-[minmax(0,1fr)_20rem]'} ${
            sectionScroll ? 'admin-schedule-section-board' : ''
          } ${
            sectionScroll && showRail
              ? 'admin-schedule-section-board-rail overflow-y-auto xl:overflow-hidden'
              : ''
          }`}
        >
          <main className={sectionScroll ? 'admin-schedule-section-workspace min-w-0' : 'min-w-0'}>
            {!monthGrid ? <p className="mb-4 text-sm text-text-muted">{ADMIN_UI.scheduleTimezone}</p> : null}
            {!loadFailed ? (
              <ScheduleCalendarToolbar
                mode={mode}
                cursorIso={cursorIso}
                showMonthControls={monthGrid && loaded}
                departureCount={visibleDepartureCount}
                weekLayout={weekLayout}
                onWeekLayoutChange={setWeekLayout}
                onModeChange={setMode}
                onPrevious={() => setCursorIso(shiftScheduleCursor(mode, cursorIso, -1))}
                onNext={() => setCursorIso(shiftScheduleCursor(mode, cursorIso, 1))}
                onToday={() => {
                  setCursorIso(vladivostokCalendarDate());
                  setSelectedDayIso(vladivostokCalendarDate());
                }}
              />
            ) : null}
      {publishDisabledReason != null ? (
        <AdminDisabledHint id="schedule-publish-hint">{publishDisabledReason}</AdminDisabledHint>
      ) : null}
      {error != null && !loadFailed ? <AdminAlert tone="danger">{error}</AdminAlert> : null}
      {loadFailed ? (
        <AdminErrorState
          title={ADMIN_UI.scheduleLoadError}
          onRetry={() => {
            setLoaded(false);
            setError(null);
            void reload();
          }}
        />
      ) : !loaded ? (
        <AdminSkeleton variant="cards" count={monthGrid ? 8 : 4} />
      ) : monthGrid ? (
        <>
          <div className="mt-3">
            <ScheduleMonthGrid
              visibleDays={visibleDays}
              cursorIso={cursorIso}
              todayIso={todayIso}
              departures={departures}
              tourTitles={tourTitles}
              tourImageUrls={tourImageUrls}
              selectedDepartureId={editing?.id}
              selectedDayIso={selectedDayIso}
              visibleDepartureCount={SCHEDULE_CELL_VISIBLE_DEPARTURES}
              onCellActivate={onCellActivate}
              onQuickAdd={openWizardForCell}
              onOpenDeparture={openDepartureFromMonth}
              onOpenDayDetail={openDayDetail}
              onDropChip={(departureId, startsOn) => {
                void onDropChip(departureId, startsOn);
              }}
            />
          </div>
        </>
      ) : mode === 'week' && weekSplitDesktop && weekSelectedIso != null ? (
        <ScheduleWeekSplitLayout
          days={visibleDays}
          departures={departures}
          selectedDayIso={weekSelectedIso}
          tourTitles={tourTitles}
          tourImageUrls={tourImageUrls}
          toursById={toursById}
          selectedDepartureId={editing?.id}
          todayIso={todayIso}
          onSelectDay={onSelectWeekDay}
          onAddOnDate={openWizardForCell}
          onOpenDeparture={openExisting}
          onStatusChange={(departure, status) => {
            void changeQuickStatus(departure, status);
          }}
          onDropChip={(departureId, startsOn) => {
            void onDropChip(departureId, startsOn);
          }}
        />
      ) : mode === 'week' ? (
        <ScheduleWeekListLayout
          days={visibleDays}
          departures={departures}
          tourTitles={tourTitles}
          tourImageUrls={tourImageUrls}
          toursById={toursById}
          selectedDayIso={weekSelectedIso}
          selectedDepartureId={editing?.id}
          todayIso={todayIso}
          onSelectDay={onSelectWeekDay}
          onAddOnDate={openWizardForCell}
          onOpenDeparture={openExisting}
          onStatusChange={(departure, status) => {
            void changeQuickStatus(departure, status);
          }}
          onDropChip={(departureId, startsOn) => {
            void onDropChip(departureId, startsOn);
          }}
        />
      ) : (
        <ScheduleWeekListLayout
          days={visibleDays}
          departures={departures}
          tourTitles={tourTitles}
          tourImageUrls={tourImageUrls}
          toursById={toursById}
          selectedDayIso={cursorIso}
          selectedDepartureId={editing?.id}
          todayIso={todayIso}
          emptyTitle={ADMIN_UI.scheduleDayEmpty}
          className="admin-schedule-day-agenda"
          onSelectDay={onSelectWeekDay}
          onAddOnDate={openWizardForCell}
          onOpenDeparture={openExisting}
          onStatusChange={(departure, status) => {
            void changeQuickStatus(departure, status);
          }}
          onDropChip={(departureId, startsOn) => {
            void onDropChip(departureId, startsOn);
          }}
        />
      )}
          </main>
          {showRail ? (
          <ScheduleOperationalRail
            nearestDepartures={nearestRailDepartures}
            toursById={toursById}
            onStatusChange={(departure, status) => {
              void changeQuickStatus(departure, status);
            }}
          />
          ) : null}
        </div>
      </div>
      {wizard != null ? (
        <AddDepartureWizard
          pickableTours={pickableTours}
          lockedTourId={wizard.lockedTourId}
          lockedStartsOn={wizard.lockedStartsOn}
          excludedTourIds={
            wizard.lockedStartsOn == null
              ? []
              : departures
                  .filter(
                    (departure) =>
                      departure.startsOn === wizard.lockedStartsOn && departure.status !== 'cancelled',
                  )
                  .map((departure) => departure.tourId)
          }
          onClose={() => setWizard(null)}
          onComplete={(input) => void finishWizard(input)}
        />
      ) : null}
      {stackIso != null ? (
        <ScheduleDayDeparturesDialog
          startsOn={stackIso}
          departures={departures.filter((departure) => departure.startsOn === stackIso)}
          tourTitles={tourTitles}
          tourImageUrls={tourImageUrls}
          selectedId={editing?.id}
          onStatusChange={(departure, status) => {
            void changeQuickStatus(departure, status);
          }}
          onAddDeparture={() => openWizardForCell(stackIso)}
          onSelect={openExisting}
          onClose={() => setStackIso(null)}
        />
      ) : null}
      {editing != null ? (
        <DepartureEditorSheet
          departure={editing}
          onChange={setEditing}
          onRequestCancel={() => setCancelOpen(true)}
          onRequestDelete={requestDeleteEditor}
          onClose={() => setEditing(null)}
          onSave={() => void saveEditor()}
        />
      ) : null}
      {cancelOpen && editing != null ? (
        <CancelDepartureDialog
          onClose={() => setCancelOpen(false)}
          onConfirm={() => {
            setEditing({ ...editing, status: 'cancelled' });
            setCancelOpen(false);
          }}
        />
      ) : null}
      {pendingDelete != null ? (
        <AdminConfirmDialog
          title={ADMIN_UI.scheduleDeleteTitle}
          description={
            pendingDelete.publishedAt == null
              ? ADMIN_UI.scheduleDeleteBody
              : ADMIN_UI.scheduleDeletePublishedBody
          }
          confirmLabel={ADMIN_UI.scheduleDeleteConfirm}
          onConfirm={() => void deletePending()}
          onClose={() => {
            setEditing(pendingDelete);
            setPendingDelete(null);
          }}
        />
      ) : null}
    </AdminPageFrame>
  );
};

export default SchedulePage;
