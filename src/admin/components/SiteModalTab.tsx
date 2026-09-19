import { ContactRound, FileText, Mail, MessageCircle, Phone } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import type { ContactsContentDocument, ModalContentDocument } from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import AdminEditorSurface from './AdminEditorSurface';
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
      className="flex flex-col gap-3"
    >
      <AdminEditorSurface icon={MessageCircle} title={ADMIN_UI.siteTabModal} hint={ADMIN_UI.siteModalHint}>
        <p className="text-sm text-text-muted">{ADMIN_UI.siteCtaScope}</p>
        <ModeSelector
          mode={mode}
          onChange={(nextMode) => onChange({ ...value, requestFormEnabled: nextMode === 'request' })}
        />
      </AdminEditorSurface>
      {mode === 'request' ? (
        <AdminEditorSurface icon={FileText} title={ADMIN_UI.siteModalRequestTitle}>
          <p className="text-sm text-text-muted">{ADMIN_UI.siteModalRequestHint}</p>
        </AdminEditorSurface>
      ) : (
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.75fr)] lg:items-start">
          <AdminEditorSurface icon={ContactRound} title={ADMIN_UI.siteModalContactsTitle} hint={ADMIN_UI.siteModalContactsHint}>
            <div className="grid gap-3 sm:grid-cols-2">
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
              <div className="flex flex-col gap-1 sm:col-span-2">
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
            <p className="text-sm text-text-muted">
              {ADMIN_UI.siteModalTourCtaPreview}: {value.tourContactTitle}
            </p>
          </AdminEditorSurface>
          <AdminEditorSurface icon={Phone} title={ADMIN_UI.siteModalChannels}>
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
          </AdminEditorSurface>
        </div>
      )}
    </section>
  );
};

export default SiteModalTab;
