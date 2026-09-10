import { z } from 'zod';

export const SITE_CONTENT_SCHEMA_VERSION = 1 as const;
export const SITE_CONTENT_KINDS = ['team', 'contacts', 'footer'] as const;
export type SiteContentDocumentKind = (typeof SITE_CONTENT_KINDS)[number];

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

export type SiteContentDocument =
  | TeamContentDocument
  | ContactsContentDocument
  | FooterContentDocument;

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
  kind: SiteContentDocumentKind,
  input: unknown,
): SiteContentDocument {
  if (kind === 'team') return teamContentDocumentSchema.parse(input);
  if (kind === 'contacts') return contactsContentDocumentSchema.parse(input);
  return footerContentDocumentSchema.parse(input);
}
