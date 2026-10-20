import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseCmsToursFile, type CmsToursFile } from '../../src/cms/cmsTourDocument.ts';

export async function loadBuildCmsToursFile(
  rootDir = process.cwd(),
): Promise<CmsToursFile | null> {
  const markerPath = resolve(rootDir, 'public/data/cms/build-source.json');
  let marker: unknown;
  try {
    marker = JSON.parse(await readFile(markerPath, 'utf8')) as unknown;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
    throw new Error(`Invalid catalog build-source marker: ${markerPath}`, { cause: error });
  }

  if (typeof marker !== 'object' || marker == null || !('kind' in marker)) {
    throw new Error(`Invalid catalog build-source marker: ${markerPath}`);
  }
  const sourceKind = (marker as { kind?: unknown }).kind;
  if (sourceKind === 'legacy') return null;
  if (sourceKind !== 'cms') {
    throw new Error(`Unknown catalog build-source kind: ${String(sourceKind)}`);
  }

  const toursPath = resolve(rootDir, 'public/data/cms/tours.json');
  const input: unknown = JSON.parse(await readFile(toursPath, 'utf8'));
  return parseCmsToursFile(input);
}
