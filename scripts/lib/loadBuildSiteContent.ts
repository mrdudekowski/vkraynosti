import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  parseSiteContentDocument,
  type SiteContentDocument,
  type SiteContentDocumentKind,
} from '../../src/cms/siteContentDocument.ts';

export function bakeSiteContentRelativePath(kind: SiteContentDocumentKind): string {
  if (kind === 'seo') {
    return 'public/data/cms/site-seo/document.json';
  }
  return `public/data/cms/site-content/${kind}/document.json`;
}

export async function loadBuildPublishedSiteContent(
  kind: SiteContentDocumentKind,
  rootDir = process.cwd(),
): Promise<SiteContentDocument | null> {
  const filePath = resolve(rootDir, bakeSiteContentRelativePath(kind));
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
  try {
    return parseSiteContentDocument(kind, JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}
