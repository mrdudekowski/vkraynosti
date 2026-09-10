import { CONTACTS } from '../constants/contacts';
import { LEGAL_DOCUMENTS } from '../constants/legalDocuments';
import { LEGAL_ENTITY } from '../constants/legalEntity';
import { UI } from '../constants/ui';
import { TEAM } from '../data/teamData';
import type {
  ContactsContentDocument,
  FooterContentDocument,
  ModalContentDocument,
  SiteContentAsset,
  TeamContentDocument,
} from './siteContentDocument';

const seedAsset = (assetId: string, url: string, mimeType: string, alt = ''): SiteContentAsset => ({
  assetId,
  url,
  mimeType,
  alt,
});

const team: TeamContentDocument = {
  kind: 'team',
  schemaVersion: 1,
  members: TEAM.map((member, order) => ({
    id: member.id,
    name: member.name,
    photo: seedAsset(member.id, member.imageUrl, 'image/webp', member.name),
    role: member.role,
    roleVisible: true,
    experience: member.experience ?? '',
    experienceVisible: member.showExperienceLine !== false,
    bio: member.bio,
    bioVisible: true,
    visible: true,
    order,
  })),
};

const contacts: ContactsContentDocument = {
  kind: 'contacts',
  schemaVersion: 1,
  sectionVisible: true,
  channels: [
    { id: 'phone', label: CONTACTS.PHONE_NUMBER, href: CONTACTS.PHONE_HREF, type: 'phone', icon: { kind: 'preset', value: 'phone', alt: 'Телефон' }, visible: true, order: 0 },
    { id: 'email', label: CONTACTS.PERSONAL_DATA_EMAIL, href: `mailto:${CONTACTS.PERSONAL_DATA_EMAIL}`, type: 'email', icon: { kind: 'preset', value: 'envelope', alt: 'Email' }, visible: true, order: 1 },
    { id: 'telegram', label: CONTACTS.TELEGRAM_HANDLE, href: CONTACTS.TELEGRAM_HREF, type: 'telegram', icon: { kind: 'preset', value: 'telegram', alt: 'Telegram' }, visible: true, order: 2 },
    { id: 'max', label: UI.contact.max, href: CONTACTS.MAX_HREF, type: 'max', icon: { kind: 'preset', value: 'max', alt: 'Max' }, visible: true, order: 3 },
  ],
};

const footer: FooterContentDocument = {
  kind: 'footer',
  schemaVersion: 1,
  blocks: [
    {
      id: 'brand',
      heading: '',
      visible: true,
      order: 0,
      rows: [{ id: 'tagline', type: 'text', label: 'Описание', value: UI.footer.tagline, visible: true, order: 0 }],
    },
    {
      id: 'legal',
      heading: UI.footer.legalHeading,
      visible: true,
      order: 1,
      rows: [
        { id: 'legal-name', type: 'text', label: 'Организация', value: LEGAL_ENTITY.fullName, visible: true, order: 0 },
        { id: 'inn', type: 'text', label: UI.footer.innLabel, value: LEGAL_ENTITY.inn, visible: true, order: 1 },
        { id: 'legal-address', type: 'text', label: 'Адрес', value: LEGAL_ENTITY.legalAddress, visible: true, order: 2 },
        ...Object.values(LEGAL_DOCUMENTS).map((document, order) => ({
          id: document.id,
          type: 'pdf' as const,
          label: document.title,
          value: document.title,
          documentId: document.id,
          visible: document.showInFooter,
          order: order + 3,
          asset: seedAsset(document.id, `${locationOrigin()}/legal/${document.filename}`, 'application/pdf', document.title),
        })),
      ],
    },
    {
      id: 'navigation',
      heading: UI.footer.navHeading,
      visible: true,
      order: 2,
      rows: UI.nav.links.map((link, order) => ({
        id: `nav-${link.hash}`,
        type: 'link' as const,
        label: link.label,
        value: link.label,
        href: `/#${link.hash}`,
        visible: true,
        order,
      })),
    },
    {
      id: 'contacts',
      heading: UI.footer.contactHeading,
      visible: true,
      order: 3,
      rows: contacts.channels.map((channel) => ({
        id: `contact-${channel.id}`,
        type: 'link' as const,
        label: channel.label,
        value: channel.label,
        href: channel.href,
        icon: channel.icon,
        visible: true,
        order: channel.order,
      })),
    },
    {
      id: 'bottom',
      heading: '',
      visible: true,
      order: 4,
      rows: [
        { id: 'rights', type: 'text', label: 'Права', value: UI.footer.rights, visible: true, order: 0 },
        { id: 'cookie-settings', type: 'text', label: 'Cookies', value: UI.footer.cookieSettings, visible: true, order: 1 },
        { id: 'studio-prefix', type: 'text', label: 'Студия', value: UI.footer.studioCreditPrefix, visible: true, order: 2 },
        { id: 'studio', type: 'link', label: UI.footer.studioCreditName, value: UI.footer.studioCreditName, href: CONTACTS.STUDIO_TELEGRAM_HREF, visible: true, order: 3 },
      ],
    },
  ],
};

const modal: ModalContentDocument = {
  kind: 'modal',
  schemaVersion: 1,
  requestFormEnabled: true,
  contactTitle: 'Свяжитесь с нами',
  contactDescription: 'Выберите удобный канал связи.',
  tourContactTitle: 'Свяжитесь с нами и забронируйте тур',
};

function locationOrigin(): string {
  return typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
}

export function seedSiteContentDocuments(): { team: TeamContentDocument; contacts: ContactsContentDocument; footer: FooterContentDocument; modal: ModalContentDocument } {
  return { team, contacts, footer, modal };
}
