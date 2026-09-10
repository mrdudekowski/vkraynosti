import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import LegalPdfLink from '../legal/LegalPdfLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import type { Season, TourRequestModalPayload } from '../../types';
import { useModal } from '../../context/useModal';
import { UI } from '../../constants/ui';
import {
  TOUR_REQUEST_MODAL_PANEL_ENTER_CLASS,
  TOUR_REQUEST_MODAL_STEP_ACTIVE_CLASS,
  TOUR_REQUEST_MODAL_STEP_CLASS,
  TOUR_REQUEST_MODAL_STEP_INACTIVE_CLASS,
  TOUR_REQUEST_MODAL_STEPS_CLASS,
  TOUR_REQUEST_SELECTED_HOLD_MS,
} from '../../constants/tourRequestModalMotion';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useTourSchedule } from '../../hooks/useTourSchedule';
import { useSyncedDepartureDisplayMonth } from '../../hooks/useSyncedDepartureDisplayMonth';
import {
  useTourRequestModalSteps,
  type TourRequestModalStep,
} from '../../hooks/useTourRequestModalSteps';
import FormField from '../form/FormField';
import FormCheckbox from '../form/FormCheckbox';
import TextInput from '../form/TextInput';
import TextArea from '../form/TextArea';
import ContactMessengerLogo from '../icons/ContactMessengerLogo';
import TourRequestDateStep from './TourRequestDateStep';
import {
  TOUR_REQUEST_MESSENGER_ICON_CLASS,
  TOUR_REQUEST_MESSENGER_ICON_WELL_CLASS,
  TOUR_REQUEST_MESSENGER_LABEL_MAX,
  TOUR_REQUEST_MESSENGER_LABEL_TELEGRAM,
  TOUR_REQUEST_MESSENGER_LABEL_WHATSAPP,
  TOUR_REQUEST_MESSENGER_RADIO_CLASS,
  TOUR_REQUEST_MESSENGER_ROW_CLASS,
} from '../../constants/tourRequestMessenger';
import { sendTourRequestLead } from '../../services/sendTourRequestLead';
import { buildTourDepartureCalendarModel } from '../../utils/tourSchedule/buildTourDepartureCalendarModel';
import { buildTourDepartureEventsByDate } from '../../utils/tourSchedule/buildTourDepartureEventsByDate';
import { parseIsoDate } from '../../utils/tourSchedule/parseIsoDate';
import { TOUR_REQUEST_MAX_PARTY_SIZE } from '../../data/tourRequestFormFields';
import {
  createTourRequestFormSchema,
  defaultTourRequestFormValues,
  type TourRequestFormInput,
} from '../../validation/tourRequestSchema';

interface TourRequestModalProps {
  payload: TourRequestModalPayload;
}

const SUBMIT_DELAY_MS = 600;
const SUCCESS_CLOSE_MS = 1800;

const flattenFirstFieldErrors = (error: import('zod').ZodError<unknown>): Record<string, string> => {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat.fieldErrors)) {
    if (Array.isArray(v) && v[0]) out[k] = v[0];
  }
  if (flat.formErrors.length > 0 && !out.privacyAccepted) {
    out.privacyAccepted = flat.formErrors[0] ?? '';
  }
  return out;
};

const stepLayerClass = (active: boolean): string =>
  [
    TOUR_REQUEST_MODAL_STEP_CLASS,
    active ? TOUR_REQUEST_MODAL_STEP_ACTIVE_CLASS : TOUR_REQUEST_MODAL_STEP_INACTIVE_CLASS,
  ].join(' ');

const TourRequestModal = ({ payload }: TourRequestModalProps) => {
  const { closeModal } = useModal();
  const { events, status: scheduleStatus } = useTourSchedule();
  const prefersReducedMotion = usePrefersReducedMotion();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stepTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tourEvents = useMemo(
    () => events.filter(event => event.tourId === payload.tourId),
    [events, payload.tourId]
  );

  const departureCalendar = useMemo(
    () => buildTourDepartureCalendarModel(payload.tourId, tourEvents),
    [payload.tourId, tourEvents]
  );

  const eventsByDate = useMemo(
    () => buildTourDepartureEventsByDate(payload.tourId, events),
    [payload.tourId, events]
  );

  const {
    initialStep,
    requiresDepartureDate,
    showDepartureDateField,
    initialDepartureDateIso,
  } = useTourRequestModalSteps({
    futureDepartureCount: departureCalendar.futureDates.length,
    preferredDepartureDateIso: payload.preferredDepartureDateIso,
    soleFutureDepartureDateIso: departureCalendar.futureDates[0],
  });

  const formSchema = useMemo(
    () => createTourRequestFormSchema(requiresDepartureDate),
    [requiresDepartureDate]
  );

  const [step, setStep] = useState<TourRequestModalStep>(initialStep);
  const [displayMonth, setDisplayMonth] = useSyncedDepartureDisplayMonth(
    departureCalendar.focusMonth
  );
  const [values, setValues] = useState<TourRequestFormInput>(() => ({
    ...defaultTourRequestFormValues,
    preferredDepartureDate: initialDepartureDateIso,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const modalAliveRef = useRef(true);
  const successCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const season: Season = payload.season ?? tourEvents[0]?.season ?? 'spring';

  useEffect(() => {
    modalAliveRef.current = true;
    return () => {
      modalAliveRef.current = false;
      if (successCloseTimerRef.current != null) {
        window.clearTimeout(successCloseTimerRef.current);
        successCloseTimerRef.current = null;
      }
      if (stepTransitionTimerRef.current != null) {
        window.clearTimeout(stepTransitionTimerRef.current);
        stepTransitionTimerRef.current = null;
      }
    };
  }, []);

  useBodyScrollLock(true);
  useModalFocusTrap(panelRef, closeModal);

  useLayoutEffect(() => {
    closeBtnRef.current?.focus();
  }, [payload.tourId]);

  useLayoutEffect(() => {
    if (step === 'form' && !submitSuccess) {
      document.getElementById('tour-request-name')?.focus();
    }
  }, [step, submitSuccess]);

  const validationResult = useMemo(() => formSchema.safeParse(values), [formSchema, values]);

  const fieldErrors = useMemo(() => {
    if (validationResult.success) return {};
    return flattenFirstFieldErrors(validationResult.error);
  }, [validationResult]);

  const canSubmit = validationResult.success && !isSubmitting && !submitSuccess && step === 'form';

  const departureDateLabel = useMemo(() => {
    const iso = values.preferredDepartureDate?.trim();
    if (iso == null || iso.length === 0) return '';
    return format(parseIsoDate(iso), 'd MMMM yyyy', { locale: ru });
  }, [values.preferredDepartureDate]);

  const handleSelectDepartureIso = useCallback(
    (iso: string) => {
      setValues(prev => ({ ...prev, preferredDepartureDate: iso }));
      const delay = prefersReducedMotion ? 0 : TOUR_REQUEST_SELECTED_HOLD_MS;
      if (stepTransitionTimerRef.current != null) {
        window.clearTimeout(stepTransitionTimerRef.current);
      }
      stepTransitionTimerRef.current = window.setTimeout(() => {
        stepTransitionTimerRef.current = null;
        setStep('form');
      }, delay);
    },
    [prefersReducedMotion]
  );

  const handleChangeDepartureDate = useCallback(() => {
    if (stepTransitionTimerRef.current != null) {
      window.clearTimeout(stepTransitionTimerRef.current);
      stepTransitionTimerRef.current = null;
    }
    setStep('date');
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await Promise.all([
        sendTourRequestLead(payload, parsed.data),
        new Promise<void>(resolve => {
          window.setTimeout(resolve, SUBMIT_DELAY_MS);
        }),
      ]);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[tourRequest] lead submit failed', err);
      }
      if (modalAliveRef.current) {
        setSubmitError(UI.tourRequestModal.submitError);
        setIsSubmitting(false);
      }
      return;
    }

    if (!modalAliveRef.current) return;
    setIsSubmitting(false);
    setSubmitSuccess(true);
    successCloseTimerRef.current = window.setTimeout(() => {
      successCloseTimerRef.current = null;
      if (modalAliveRef.current) {
        closeModal();
      }
    }, SUCCESS_CLOSE_MS);
  };

  const updateField = useCallback(<K extends keyof TourRequestFormInput>(key: K, value: TourRequestFormInput[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const tourDisplay = [payload.title, payload.subtitle].filter(Boolean).join(' — ');
  const scheduleLoading = scheduleStatus === 'loading' || scheduleStatus === 'idle';
  const showDateStep = requiresDepartureDate;

  const panelOverflowClass =
    submitSuccess || step === 'form' || !showDateStep ? 'overflow-y-auto' : 'overflow-hidden';

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-modal"
      role="presentation"
      onClick={closeModal}
    >
      <div
        ref={panelRef}
        className={`relative bg-white rounded-modal max-w-lg w-full max-h-modal-body ${panelOverflowClass} shadow-xl flex flex-col ${TOUR_REQUEST_MODAL_PANEL_ENTER_CLASS}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-request-title"
        onClick={e => e.stopPropagation()}
      >
        <input type="hidden" name="tourId" value={payload.tourId} readOnly form="tour-request-form" />

        <button
          ref={closeBtnRef}
          type="button"
          onClick={closeModal}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-hover"
          aria-label={UI.modal.close}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="p-8 pt-14">
          <h2 id="tour-request-title" className="font-heading text-2xl font-normal text-text-primary mb-6">
            {UI.tourRequestModal.title}
          </h2>

          {submitSuccess ? (
            <p className="text-text-muted" role="status">
              {UI.tourRequestModal.success}
            </p>
          ) : (
            <div className={TOUR_REQUEST_MODAL_STEPS_CLASS}>
              {showDateStep && (
                <div
                  className={stepLayerClass(step === 'date')}
                  aria-hidden={step !== 'date'}
                  {...(step !== 'date' ? { inert: true } : {})}
                >
                  <TourRequestDateStep
                    season={season}
                    departureCalendar={departureCalendar}
                    eventsByDate={eventsByDate}
                    displayMonth={displayMonth}
                    onDisplayMonthChange={setDisplayMonth}
                    selectedIso={values.preferredDepartureDate}
                    onSelectIso={handleSelectDepartureIso}
                    scheduleLoading={scheduleLoading}
                  />
                </div>
              )}

              <div
                className={stepLayerClass(step === 'form')}
                aria-hidden={step !== 'form'}
                {...(step !== 'form' ? { inert: true } : {})}
              >
                <form id="tour-request-form" onSubmit={onSubmit} className="flex flex-col gap-5">
                  <FormField id="tour-request-tour" label={UI.tourRequestModal.tourLabel}>
                    <TextInput
                      id="tour-request-tour"
                      readOnly
                      tabIndex={-1}
                      value={tourDisplay}
                      aria-readonly="true"
                      className="bg-surface-light cursor-default"
                    />
                  </FormField>

                  {showDepartureDateField && (
                    <FormField
                      id="tour-request-departure"
                      label={UI.tourRequestModal.departureDateLabel}
                      error={fieldErrors.preferredDepartureDate}
                      labelAside={
                        <button
                          type="button"
                          onClick={handleChangeDepartureDate}
                          className="text-sm font-medium text-brand-primary underline underline-offset-2 hover:brightness-110 transition-all duration-hover shrink-0"
                        >
                          {UI.tourRequestModal.changeDepartureDate}
                        </button>
                      }
                    >
                      <TextInput
                        id="tour-request-departure"
                        readOnly
                        tabIndex={-1}
                        value={departureDateLabel}
                        aria-readonly="true"
                        className="bg-surface-light cursor-default"
                        hasError={!!fieldErrors.preferredDepartureDate}
                        aria-invalid={!!fieldErrors.preferredDepartureDate}
                      />
                    </FormField>
                  )}

                  <FormField
                    id="tour-request-name"
                    label={UI.tourRequestModal.nameLabel}
                    required
                    hint={UI.tourRequestModal.nameHint}
                    hintBelow
                    error={fieldErrors.name}
                  >
                    <TextInput
                      id="tour-request-name"
                      name="name"
                      autoComplete="name"
                      value={values.name}
                      onChange={e => updateField('name', e.target.value)}
                      hasError={!!fieldErrors.name}
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={
                        fieldErrors.name ? 'tour-request-name-error' : 'tour-request-name-hint'
                      }
                    />
                  </FormField>

                  <FormField
                    id="tour-request-email"
                    label={UI.tourRequestModal.emailLabel}
                    hint={UI.tourRequestModal.emailHint}
                    error={fieldErrors.email}
                  >
                    <TextInput
                      id="tour-request-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={e => updateField('email', e.target.value)}
                      hasError={!!fieldErrors.email}
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'tour-request-email-error' : 'tour-request-email-hint'}
                    />
                  </FormField>

                  <FormField
                    id="tour-request-phone"
                    label={UI.tourRequestModal.phoneLabel}
                    required
                    error={fieldErrors.phone}
                  >
                    <TextInput
                      id="tour-request-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      placeholder={UI.tourRequestModal.phonePlaceholder}
                      value={values.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      hasError={!!fieldErrors.phone}
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={fieldErrors.phone ? 'tour-request-phone-error' : undefined}
                    />
                  </FormField>

                  <FormField
                    id="tour-request-party-size"
                    label={UI.tourRequestModal.partySizeLabel}
                    required
                    error={fieldErrors.partySize}
                  >
                    <TextInput
                      id="tour-request-party-size"
                      type="number"
                      name="partySize"
                      inputMode="numeric"
                      min={1}
                      max={TOUR_REQUEST_MAX_PARTY_SIZE}
                      step={1}
                      value={values.partySize}
                      onChange={e => updateField('partySize', e.target.value)}
                      hasError={!!fieldErrors.partySize}
                      aria-invalid={!!fieldErrors.partySize}
                      aria-describedby={
                        fieldErrors.partySize ? 'tour-request-party-size-error' : undefined
                      }
                    />
                  </FormField>

                  <div className="flex items-start gap-3">
                    <FormCheckbox
                      id="tour-request-with-children"
                      className="mt-0.5"
                      checked={values.withChildren}
                      onChange={e => updateField('withChildren', e.target.checked)}
                    />
                    <label
                      htmlFor="tour-request-with-children"
                      className="text-sm text-text-primary leading-relaxed cursor-pointer"
                    >
                      {UI.tourRequestModal.withChildrenLabel}
                    </label>
                  </div>

                  <FormField
                    id="tour-request-question"
                    label={UI.tourRequestModal.questionLabel}
                    hint={UI.tourRequestModal.questionHint}
                    error={fieldErrors.question}
                  >
                    <TextArea
                      id="tour-request-question"
                      name="question"
                      value={values.question}
                      onChange={e => updateField('question', e.target.value)}
                      hasError={!!fieldErrors.question}
                      aria-invalid={!!fieldErrors.question}
                      aria-describedby={
                        fieldErrors.question
                          ? 'tour-request-question-error'
                          : 'tour-request-question-hint'
                      }
                    />
                  </FormField>

                  <fieldset
                    className="flex flex-col gap-2 border-0 p-0 m-0 min-w-0"
                    aria-describedby={
                      fieldErrors.preferredMessenger ? 'tour-request-messenger-error' : undefined
                    }
                  >
                    <legend className="text-sm font-medium text-text-primary mb-1">
                      {UI.tourRequestModal.messengerLabel}
                      <span className="text-difficulty-hard-fg" aria-hidden>
                        {' '}
                        *
                      </span>
                    </legend>
                    <div className={TOUR_REQUEST_MESSENGER_ROW_CLASS}>
                      <label
                        htmlFor="tour-request-messenger-whatsapp"
                        className={TOUR_REQUEST_MESSENGER_LABEL_WHATSAPP}
                      >
                        <input
                          id="tour-request-messenger-whatsapp"
                          type="radio"
                          name="preferredMessenger"
                          value="whatsapp"
                          checked={values.preferredMessenger === 'whatsapp'}
                          onChange={() => updateField('preferredMessenger', 'whatsapp')}
                          className={TOUR_REQUEST_MESSENGER_RADIO_CLASS}
                          aria-label={UI.tourRequestModal.messengerWhatsappAria}
                          aria-invalid={!!fieldErrors.preferredMessenger}
                        />
                        <span className={TOUR_REQUEST_MESSENGER_ICON_WELL_CLASS}>
                          <ContactMessengerLogo
                            variant="whatsapp"
                            className={TOUR_REQUEST_MESSENGER_ICON_CLASS}
                          />
                        </span>
                      </label>
                      <label
                        htmlFor="tour-request-messenger-telegram"
                        className={TOUR_REQUEST_MESSENGER_LABEL_TELEGRAM}
                      >
                        <input
                          id="tour-request-messenger-telegram"
                          type="radio"
                          name="preferredMessenger"
                          value="telegram"
                          checked={values.preferredMessenger === 'telegram'}
                          onChange={() => updateField('preferredMessenger', 'telegram')}
                          className={TOUR_REQUEST_MESSENGER_RADIO_CLASS}
                          aria-label={UI.tourRequestModal.messengerTelegramAria}
                          aria-invalid={!!fieldErrors.preferredMessenger}
                        />
                        <span className={TOUR_REQUEST_MESSENGER_ICON_WELL_CLASS}>
                          <ContactMessengerLogo
                            variant="telegram"
                            className={TOUR_REQUEST_MESSENGER_ICON_CLASS}
                          />
                        </span>
                      </label>
                      <label
                        htmlFor="tour-request-messenger-max"
                        className={TOUR_REQUEST_MESSENGER_LABEL_MAX}
                      >
                        <input
                          id="tour-request-messenger-max"
                          type="radio"
                          name="preferredMessenger"
                          value="max"
                          checked={values.preferredMessenger === 'max'}
                          onChange={() => updateField('preferredMessenger', 'max')}
                          className={TOUR_REQUEST_MESSENGER_RADIO_CLASS}
                          aria-label={UI.tourRequestModal.messengerMaxAria}
                          aria-invalid={!!fieldErrors.preferredMessenger}
                        />
                        <span className={TOUR_REQUEST_MESSENGER_ICON_WELL_CLASS}>
                          <ContactMessengerLogo
                            variant="max"
                            className={TOUR_REQUEST_MESSENGER_ICON_CLASS}
                          />
                        </span>
                      </label>
                    </div>
                    {fieldErrors.preferredMessenger ? (
                      <p
                        id="tour-request-messenger-error"
                        role="alert"
                        className="sr-only text-tooltip"
                      >
                        {fieldErrors.preferredMessenger}
                      </p>
                    ) : null}
                  </fieldset>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                      <FormCheckbox
                        id="tour-request-privacy"
                        className="mt-1"
                        checked={values.privacyAccepted}
                        onChange={e => updateField('privacyAccepted', e.target.checked)}
                        aria-invalid={!!fieldErrors.privacyAccepted}
                        aria-describedby={fieldErrors.privacyAccepted ? 'tour-request-privacy-error' : undefined}
                      />
                      <label
                        htmlFor="tour-request-privacy"
                        className="text-sm text-text-muted leading-relaxed cursor-pointer"
                      >
                        <span className="text-difficulty-hard-fg" aria-hidden>
                          *
                        </span>{' '}
                        {UI.tourRequestModal.privacyPrefix}
                        <LegalPdfLink
                          documentId="personal-data-policy"
                          className="text-brand-primary underline underline-offset-2 hover:brightness-110 transition-all duration-hover"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {UI.tourRequestModal.privacyPolicyLink}
                        </LegalPdfLink>
                        {UI.tourRequestModal.privacyMiddle}
                        <LegalPdfLink
                          documentId="personal-data-consent"
                          className="text-brand-primary underline underline-offset-2 hover:brightness-110 transition-all duration-hover"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {UI.tourRequestModal.privacyConsentLink}
                        </LegalPdfLink>
                        {UI.tourRequestModal.privacySuffix}
                      </label>
                    </div>
                    {fieldErrors.privacyAccepted ? (
                      <p id="tour-request-privacy-error" role="alert" className="sr-only text-tooltip">
                        {fieldErrors.privacyAccepted}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="btn-primary inline-flex items-center justify-center gap-2 text-center w-max max-w-full self-start disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" aria-hidden />
                        <span>{UI.tourRequestModal.sending}</span>
                      </>
                    ) : (
                      <>{UI.tourRequestModal.submit}</>
                    )}
                  </button>
                  {submitError ? (
                    <p role="alert" className="text-sm text-difficulty-hard-fg">
                      {submitError}
                    </p>
                  ) : null}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TourRequestModal;
