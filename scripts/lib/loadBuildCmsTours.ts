import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseCmsToursFile, type CmsToursFile } from '../../src/cms/cmsTourDocument.ts';
import { loadBuildPublicSnapshot } from './loadBuildPublicSnapshot.ts';

export async function loadBuildCmsToursFile(
  rootDir = process.cwd(),
): Promise<CmsToursFile | null> {
  const snapshot = await loadBuildPublicSnapshot(rootDir);
  if (snapshot == null) return null;
  const toursPath = resolve(rootDir, 'public/data/cms/tours.json');
  const input: unknown = JSON.parse(await readFile(toursPath, 'utf8'));
  return parseCmsToursFile(input);
}
