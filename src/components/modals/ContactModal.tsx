import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Phone, X } from 'lucide-react';
import { useModal } from '../../context/useModal';
import { useSiteContent } from '../../context/SiteContentContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import ContactMessengerLogo from '../icons/ContactMessengerLogo';
import { toSafeExternalHttpHref, toSafeMailtoHref, toSafePhoneHref } from '../../utils/safeHref';
import { UI } from '../../constants/ui';

type ContactModalProps = { tourTitle?: string };

const ContactModal = ({ tourTitle }: ContactModalProps) => {
  const { closeModal } = useModal();
  const { contacts, modal } = useSiteContent();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(true);
  useModalFocusTrap(panelRef, closeModal);
  useLayoutEffect(() => closeRef.current?.focus(), []);

  const channels = [...contacts.channels].filter((channel) => channel.visible).sort((a, b) => a.order - b.order);
  const title = tourTitle == null ? modal.contactTitle : modal.tourContactTitle;
  const hrefFor = (channel: (typeof channels)[number]) => channel.type === 'phone' ? toSafePhoneHref(channel.href) : channel.type === 'email' ? toSafeMailtoHref(channel.href) : toSafeExternalHttpHref(channel.href);
  const iconFor = (channel: (typeof channels)[number]) => channel.type === 'phone' ? <Phone size={20} aria-hidden="true" /> : channel.type === 'email' ? <Mail size={20} aria-hidden="true" /> : <ContactMessengerLogo variant={channel.type === 'whatsapp' ? 'whatsapp' : channel.type === 'max' ? 'max' : 'telegram'} className="h-5 w-5 object-contain" />;

  return createPortal(<div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="presentation" onClick={closeModal}><div ref={panelRef} className="relative flex w-full max-w-md flex-col gap-6 rounded-modal bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" onClick={(event) => event.stopPropagation()}><button ref={closeRef} type="button" onClick={closeModal} className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-text-primary transition-colors hover:bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary" aria-label={UI.modal.close}><X size={20} aria-hidden="true" /></button><div className="pr-10"><h2 id="contact-modal-title" className="font-heading text-2xl text-text-primary">{title}</h2><p className="mt-2 text-sm text-text-muted">{modal.contactDescription}</p></div>{channels.length === 0 ? <p className="rounded-admin-control bg-surface-light p-3 text-sm text-text-muted">Связь временно недоступна.</p> : <div className="grid gap-2">{channels.map((channel) => <a key={channel.id} href={hrefFor(channel)} target={channel.type === 'phone' || channel.type === 'email' ? undefined : '_blank'} rel={channel.type === 'phone' || channel.type === 'email' ? undefined : 'noopener noreferrer external'} className="flex min-h-12 items-center gap-3 rounded-admin-control border border-divider px-3 py-2 text-text-primary transition-colors hover:bg-surface-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">{iconFor(channel)}<span className="min-w-0 truncate">{channel.label}</span></a>)}</div>}{tourTitle != null ? <p className="text-xs text-text-muted">Тур: {tourTitle}</p> : null}</div></div>, document.body);
};

export default ContactModal;
