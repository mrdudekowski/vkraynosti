export type TourRequestModalStep = 'date' | 'form';

export interface UseTourRequestModalStepsInput {
  futureDepartureCount: number;
  preferredDepartureDateIso?: string;
  /** Единственная будущая дата, если count === 1. SSOT: futureDates[0] из модели. */
  soleFutureDepartureDateIso?: string;
}

export interface UseTourRequestModalStepsResult {
  initialStep: TourRequestModalStep;
  requiresDepartureDate: boolean;
  /** Показывать блок «Дата выезда» + «Изменить дату». false при count === 0. */
  showDepartureDateField: boolean;
  /** Подставить в форму при mount (учитывает count и prefill в payload). */
  initialDepartureDateIso: string;
}

const hasPreferredDeparture = (iso: string | undefined): boolean =>
  iso != null && iso.trim().length > 0;

/**
 * Начальный шаг модалки заявки: календарь даты или сразу форма.
 */
export const useTourRequestModalSteps = ({
  futureDepartureCount,
  preferredDepartureDateIso,
  soleFutureDepartureDateIso,
}: UseTourRequestModalStepsInput): UseTourRequestModalStepsResult => {
  const requiresDepartureDate = futureDepartureCount > 0;
  const showDepartureDateField = futureDepartureCount > 0;
  const hasPrefill = hasPreferredDeparture(preferredDepartureDateIso);

  let initialDepartureDateIso = '';
  if (futureDepartureCount === 0) {
    initialDepartureDateIso = '';
  } else if (hasPrefill) {
    initialDepartureDateIso = preferredDepartureDateIso!.trim();
  } else if (futureDepartureCount === 1) {
    initialDepartureDateIso = soleFutureDepartureDateIso?.trim() ?? '';
  }

  let initialStep: TourRequestModalStep = 'form';
  if (futureDepartureCount >= 2 && !hasPrefill) {
    initialStep = 'date';
  }

  return {
    initialStep,
    requiresDepartureDate,
    showDepartureDateField,
    initialDepartureDateIso,
  };
};
