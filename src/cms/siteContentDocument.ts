import { z } from 'zod';
import { parseSiteSeoDocument, type SiteSeoDocument } from './siteSeoDocument';

export const SITE_CONTENT_SCHEMA_VERSION = 1 as const;
export const SITE_POLICY_DOCUMENT_IDS = [
  'offer-and-safety',
  'payment-cancellation-refund',
  'personal-data-policy',
  'personal-data-consent',
] as const;
export type SitePolicyDocumentId = (typeof SITE_POLICY_DOCUMENT_IDS)[number];
export const SITE_POLICY_KINDS = [
  'policy-offer-and-safety',
  'policy-payment-cancellation-refund',
  'policy-personal-data-policy',
  'policy-personal-data-consent',
] as const;
export type SitePolicyKind = (typeof SITE_POLICY_KINDS)[number];
export const SITE_CONTENT_KINDS = [
  'team',
  'contacts',
  'footer',
  'modal',
  'seo',
  ...SITE_POLICY_KINDS,
] as const;
export type SiteContentDocumentKind = (typeof SITE_CONTENT_KINDS)[number];

export function isSitePolicyKind(kind: string): kind is SitePolicyKind {
  return (SITE_POLICY_KINDS as readonly string[]).includes(kind);
}

export function isPolicyContentDocument(
  document: SiteContentDocument,
): document is PolicyContentDocument {
  return isSitePolicyKind(document.kind);
}

export function isSitePolicyDocumentId(id: string): id is SitePolicyDocumentId {
  return (SITE_POLICY_DOCUMENT_IDS as readonly string[]).includes(id);
}

export function policyKindFromDocumentId(documentId: SitePolicyDocumentId): SitePolicyKind {
  return `policy-${documentId}` as SitePolicyKind;
}

export function policyDocumentIdFromKind(kind: SitePolicyKind): SitePolicyDocumentId {
  return kind.slice('policy-'.length) as SitePolicyDocumentId;
}

const visibilitySchema = z.boolean().default(true);
const orderSchema = z.number().int().min(0).default(0);

export const siteContentAssetSchema = z.object({
  assetId: z.string().min(1),
  url: z.string().trim().min(1),
  mimeType: z.string().min(1),
  alt: z.string().default(''),
});
export type SiteContentAsset = z.infer<typeof siteContentAssetSchema>;

const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  photo: siteContentAssetSchema,
  role: z.string().default(''),
  roleVisible: visibilitySchema,
  experience: z.string().default(''),
  experienceVisible: visibilitySchema,
  bio: z.string().default(''),
  bioVisible: visibilitySchema,
  visible: visibilitySchema,
  order: orderSchema,
});
export type TeamContentMember = z.infer<typeof teamMemberSchema>;

export const teamContentDocumentSchema = z.object({
  kind: z.literal('team'),
  schemaVersion: z.literal(SITE_CONTENT_SCHEMA_VERSION),
  members: z.array(teamMemberSchema),
});
export type TeamContentDocument = z.infer<typeof teamContentDocumentSchema>;

const iconSchema = z.object({
  kind: z.enum(['preset', 'asset']),
  value: z.string().min(1),
  alt: z.string().default(''),
});

const contactChannelSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1),
  href: z.string().trim().min(1),
  type: z.string().min(1),
  icon: iconSchema.optional(),
  visible: visibilitySchema,
  order: orderSchema,
});
export type SiteContactChannel = z.infer<typeof contactChannelSchema>;

export const contactsContentDocumentSchema = z.object({
  kind: z.literal('contacts'),
  schemaVersion: z.literal(SITE_CONTENT_SCHEMA_VERSION),
  sectionVisible: visibilitySchema,
  channels: z.array(contactChannelSchema),
});
export type ContactsContentDocument = z.infer<typeof contactsContentDocumentSchema>;

export const modalContentDocumentSchema = z.object({
  kind: z.literal('modal'),
  schemaVersion: z.literal(SITE_CONTENT_SCHEMA_VERSION),
  requestFormEnabled: z.boolean().default(true),
  contactTitle: z.string().trim().min(1).default('Свяжитесь с нами'),
  contactDescription: z.string().trim().default('Выберите удобный канал связи.'),
  tourContactTitle: z.string().trim().min(1).default('Свяжитесь с нами и забронируйте тур'),
});
export type ModalContentDocument = z.infer<typeof modalContentDocumentSchema>;

const footerRowBaseSchema = z.object({
  id: z.string().min(1),
  label: z.string().default(''),
  icon: iconSchema.optional(),
  visible: visibilitySchema,
  order: orderSchema,
});

const footerTextRowSchema = footerRowBaseSchema.extend({
  type: z.literal('text'),
  value: z.string(),
});

const footerLinkRowSchema = footerRowBaseSchema.extend({
  type: z.literal('link'),
  value: z.string(),
  href: z.string().trim().min(1),
});

const footerPdfRowSchema = footerRowBaseSchema.extend({
  type: z.literal('pdf'),
  value: z.string(),
  documentId: z.string().min(1),
  asset: siteContentAssetSchema.optional(),
});

export const footerRowSchema = z.discriminatedUnion('type', [
  footerTextRowSchema,
  footerLinkRowSchema,
  footerPdfRowSchema,
]);
export type FooterContentRow = z.infer<typeof footerRowSchema>;

const footerBlockSchema = z.object({
  id: z.string().min(1),
  heading: z.string().default(''),
  visible: visibilitySchema,
  order: orderSchema,
  rows: z.array(footerRowSchema),
});
export type FooterContentBlock = z.infer<typeof footerBlockSchema>;

export const footerContentDocumentSchema = z.object({
  kind: z.literal('footer'),
  schemaVersion: z.literal(SITE_CONTENT_SCHEMA_VERSION),
  blocks: z.array(footerBlockSchema),
});
export type FooterContentDocument = z.infer<typeof footerContentDocumentSchema>;

export const policyContentDocumentSchema = z.object({
  kind: z.enum(SITE_POLICY_KINDS),
  schemaVersion: z.literal(SITE_CONTENT_SCHEMA_VERSION),
  documentId: z.enum(SITE_POLICY_DOCUMENT_IDS),
  title: z.string().trim().min(1),
  asset: siteContentAssetSchema.optional(),
  bodyHtml: z.string().default(''),
});
export type PolicyContentDocument = z.infer<typeof policyContentDocumentSchema>;

export type SiteContentDocument =
  | TeamContentDocument
  | ContactsContentDocument
  | FooterContentDocument
  | ModalContentDocument
  | SiteSeoDocument
  | PolicyContentDocument;

export function parseSiteContentDocument(
  kind: 'team',
  input: unknown,
): TeamContentDocument;
export function parseSiteContentDocument(
  kind: 'contacts',
  input: unknown,
): ContactsContentDocument;
export function parseSiteContentDocument(
  kind: 'footer',
  input: unknown,
): FooterContentDocument;
export function parseSiteContentDocument(
  kind: 'modal',
  input: unknown,
): ModalContentDocument;
export function parseSiteContentDocument(kind: 'seo', input: unknown): SiteSeoDocument;
export function parseSiteContentDocument(
  kind: SitePolicyKind,
  input: unknown,
): PolicyContentDocument;
export function parseSiteContentDocument(
  kind: SiteContentDocumentKind,
  input: unknown,
): SiteContentDocument;
export function parseSiteContentDocument(
  kind: SiteContentDocumentKind,
  input: unknown,
): SiteContentDocument {
  if (kind === 'team') return teamContentDocumentSchema.parse(input);
  if (kind === 'contacts') return contactsContentDocumentSchema.parse(input);
  if (kind === 'modal') return modalContentDocumentSchema.parse(input);
  if (kind === 'seo') return parseSiteSeoDocument(input);
  if (isSitePolicyKind(kind)) {
    const source = typeof input === 'object' && input != null ? input : {};
    return policyContentDocumentSchema.parse({
      ...source,
      kind,
      schemaVersion: SITE_CONTENT_SCHEMA_VERSION,
      documentId: policyDocumentIdFromKind(kind),
    });
  }
  return footerContentDocumentSchema.parse(input);
}
