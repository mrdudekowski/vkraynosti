import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import type { TourRequestModalPayload } from '../../types';
import { useModal } from '../../context/useModal';
import { UI } from '../../constants/ui';
import { ROUTES } from '../../constants/routes';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import FormField from '../form/FormField';
import FormCheckbox from '../form/FormCheckbox';
import TextInput from '../form/TextInput';
import TextArea from '../form/TextArea';
import ContactMessengerLogo from '../icons/ContactMessengerLogo';
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
import {
  tourRequestFormSchema,
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

const TourRequestModal = ({ payload }: TourRequestModalProps) => {
  const { closeModal } = useModal();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<TourRequestFormInput>(defaultTourRequestFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const modalAliveRef = useRef(true);
  const successCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    modalAliveRef.current = true;
    return () => {
      modalAliveRef.current = false;
      if (successCloseTimerRef.current != null) {
        window.clearTimeout(successCloseTimerRef.current);
        successCloseTimerRef.current = null;
      }
    };
  }, []);

  useBodyScrollLock(true);
  useModalFocusTrap(panelRef, closeModal);

  useLayoutEffect(() => {
    closeBtnRef.current?.focus();
  }, [payload.tourId]);

  const validationResult = useMemo(() => tourRequestFormSchema.safeParse(values), [values]);

  const fieldErrors = useMemo(() => {
    if (validationResult.success) return {};
    return flattenFirstFieldErrors(validationResult.error);
  }, [validationResult]);

  const canSubmit = validationResult.success && !isSubmitting && !submitSuccess;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = tourRequestFormSchema.safeParse(values);
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

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-modal"
      role="presentation"
      onClick={closeModal}
    >
      <div
        ref={panelRef}
        className="relative bg-white rounded-modal max-w-lg w-full max-h-modal-body overflow-y-auto shadow-xl animate-scale-in flex flex-col"
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
                    fieldErrors.name
                      ? 'tour-request-name-error'
                      : 'tour-request-name-hint'
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
                    <Link
                      to={ROUTES.PRIVACY}
                      className="text-brand-primary underline underline-offset-2 hover:brightness-110 transition-all duration-hover"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                    >
                      {UI.tourRequestModal.privacyLink}
                    </Link>
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
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TourRequestModal;
