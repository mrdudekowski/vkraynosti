import { ContactRound, FileText, Mail, MessageCircle, Phone } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import type { ContactsContentDocument, ModalContentDocument } from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import { AdminFieldLabel, AdminTextArea, AdminTextInput } from './AdminFields';
import AdminIcon from './AdminIcon';

type SiteModalTabProps = {
  value: ModalContentDocument;
  onChange: (value: ModalContentDocument) => void;
  contacts?: ContactsContentDocument;
  contactsError?: string;
};

const channelIcon = (type: string) => {
  if (type === 'phone') return Phone;
  if (type === 'email') return Mail;
  if (type === 'telegram' || type === 'whatsapp' || type === 'max') return MessageCircle;
  return ContactRound;
};

const ModeSelector = ({
  mode,
  onChange,
}: {
  mode: 'request' | 'contacts';
  onChange: (mode: 'request' | 'contacts') => void;
}) => {
  const options = [
    { id: 'request' as const, label: ADMIN_UI.siteModalRequest, icon: FileText },
    { id: 'contacts' as const, label: ADMIN_UI.siteModalContacts, icon: ContactRound },
  ];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    event.preventDefault();
    onChange(mode === 'request' ? 'contacts' : 'request');
  };

  return (
    <div
      role="radiogroup"
      aria-label={ADMIN_UI.siteCtaMode}
      className="grid min-w-0 grid-cols-2 gap-2 sm:max-w-md"
      onKeyDown={onKeyDown}
    >
      {options.map(({ id, label, icon }) => {
        const selected = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-admin-control px-2 text-sm ${
              selected ? 'admin-nav-active' : 'admin-nav-item'
            }`}
            onClick={() => onChange(id)}
          >
            <AdminIcon icon={icon} size={16} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

const SiteModalTab = ({ value, onChange, contacts, contactsError }: SiteModalTabProps) => {
  const mode = value.requestFormEnabled ? 'request' : 'contacts';
  const visibleChannels = contacts?.channels
    .filter((channel) => channel.visible)
    .sort((left, right) => left.order - right.order);

  return (
    <section
      id="admin-panel-modal"
      role="tabpanel"
      aria-labelledby="admin-tab-modal"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-text-muted">{ADMIN_UI.siteModalHint}</p>
        <p className="text-sm text-text-muted">{ADMIN_UI.siteCtaScope}</p>
        <ModeSelector
          mode={mode}
          onChange={(nextMode) => onChange({ ...value, requestFormEnabled: nextMode === 'request' })}
        />
      </div>
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <aside
          aria-label={ADMIN_UI.siteModalPreview}
          className="admin-editor-surface flex flex-col gap-3"
        >
          {mode === 'request' ? (
            <>
              <h3 className="font-heading text-card text-text-primary">
                {ADMIN_UI.siteModalRequestTitle}
              </h3>
              <div className="flex flex-col gap-2" aria-hidden="true">
                <div className="h-11 rounded-admin-control border border-divider bg-surface-dark/5" />
                <div className="h-11 rounded-admin-control border border-divider bg-surface-dark/5" />
                <div className="h-20 rounded-admin-control border border-divider bg-surface-dark/5" />
              </div>
              <p className="text-sm text-text-muted">{ADMIN_UI.siteModalRequestHint}</p>
            </>
          ) : (
            <div className="flex flex-col gap-4 rounded-card border border-divider bg-white p-5">
              <div>
                <h3 className="font-heading text-2xl text-text-primary">{value.contactTitle}</h3>
                <p className="mt-2 text-sm text-text-muted">{value.contactDescription}</p>
              </div>
              <div className="grid gap-2">
                {contactsError != null ? (
                  <p className="text-sm text-text-muted">{ADMIN_UI.siteContactsPreviewError}</p>
                ) : visibleChannels != null && visibleChannels.length > 0 ? (
                  visibleChannels.map((channel) => {
                    const Icon = channelIcon(channel.type);
                    return (
                      <div
                        key={channel.id}
                        className="flex min-h-11 min-w-0 items-center gap-2 rounded-admin-control border border-divider px-3 text-sm text-text-primary"
                      >
                        <AdminIcon icon={Icon} size={16} />
                        <span className="break-words">{channel.label}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-text-muted">{ADMIN_UI.siteContactsPreviewEmpty}</p>
                )}
              </div>
              <p className="text-tooltip text-text-muted">
                {ADMIN_UI.siteModalTourCtaPreview}: {value.tourContactTitle}
              </p>
            </div>
          )}
        </aside>
        {mode === 'contacts' ? (
          <div className="flex min-w-0 flex-col gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {ADMIN_UI.siteModalContactsTitle}
              </h3>
              <p className="text-tooltip text-text-muted">{ADMIN_UI.siteModalContactsHint}</p>
            </div>
            <div className="flex flex-col gap-1">
              <AdminFieldLabel htmlFor="modal-contact-title">
                {ADMIN_UI.siteModalContactTitle}
              </AdminFieldLabel>
              <AdminTextInput
                id="modal-contact-title"
                value={value.contactTitle}
                onChange={(event) => onChange({ ...value, contactTitle: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <AdminFieldLabel htmlFor="modal-tour-contact-title">
                {ADMIN_UI.siteModalTourCta}
              </AdminFieldLabel>
              <AdminTextInput
                id="modal-tour-contact-title"
                value={value.tourContactTitle}
                onChange={(event) => onChange({ ...value, tourContactTitle: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <AdminFieldLabel htmlFor="modal-contact-description">
                {ADMIN_UI.siteModalContactDescription}
              </AdminFieldLabel>
              <AdminTextArea
                id="modal-contact-description"
                rows={3}
                value={value.contactDescription}
                onChange={(event) =>
                  onChange({ ...value, contactDescription: event.target.value })
                }
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SiteModalTab;
