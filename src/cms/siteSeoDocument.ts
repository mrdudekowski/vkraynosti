import { z } from 'zod';

export const SITE_SEO_SCHEMA_VERSION = 1 as const;

export const SITE_SEO_PAGE_PATHS = {
  home: '/',
  winter: '/tours/winter/',
  spring: '/tours/spring/',
  summer: '/tours/summer/',
  fall: '/tours/fall/',
} as const;

export const SITE_SEO_PAGE_KEYS = ['home', 'winter', 'spring', 'summer', 'fall'] as const;

const siteSeoPageSchema = z.object({
  key: z.enum(SITE_SEO_PAGE_KEYS),
  path: z.string().min(1),
  title: z.string().default(''),
  description: z.string().default(''),
  h1: z.string().default(''),
}).superRefine((page, ctx) => {
  if (SITE_SEO_PAGE_PATHS[page.key] !== page.path) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'SEO page path does not match its fixed key', path: ['path'] });
  }
});

export const siteSeoDocumentSchema = z.object({
  kind: z.literal('seo'),
  schemaVersion: z.literal(SITE_SEO_SCHEMA_VERSION),
  pages: z.array(siteSeoPageSchema),
}).superRefine((document, ctx) => {
  const keys = new Set(document.pages.map((page) => page.key));
  if (document.pages.length !== SITE_SEO_PAGE_KEYS.length || SITE_SEO_PAGE_KEYS.some((key) => !keys.has(key))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'SEO document must contain exactly one entry for each supported page', path: ['pages'] });
  }
});

export type SiteSeoPage = z.infer<typeof siteSeoPageSchema>;
export type SiteSeoDocument = z.infer<typeof siteSeoDocumentSchema>;

export function parseSiteSeoDocument(input: unknown): SiteSeoDocument {
  return siteSeoDocumentSchema.parse(input);
}

export function createDefaultSiteSeoDocument(): SiteSeoDocument {
  return {
    kind: 'seo',
    schemaVersion: SITE_SEO_SCHEMA_VERSION,
    pages: SITE_SEO_PAGE_KEYS.map((key) => ({ key, path: SITE_SEO_PAGE_PATHS[key], title: '', description: '', h1: '' })),
  };
}
