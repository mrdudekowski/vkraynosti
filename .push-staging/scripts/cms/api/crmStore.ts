import { CMS_CRM_KEY } from '../../../src/cms/cmsPackageKeys.ts';
import { createEmptyCrmFile, parseCrmFile, type CrmFile } from '../../../src/crm/crmDocument.ts';
import type { CmsJsonStore } from './store.ts';

export async function loadCrmFile(store: CmsJsonStore): Promise<CrmFile> {
  const raw = await store.getJson(CMS_CRM_KEY);
  if (raw == null) {
    return createEmptyCrmFile();
  }
  return parseCrmFile(raw);
}

export async function saveCrmFile(store: CmsJsonStore, file: CrmFile): Promise<void> {
  await store.putJson(CMS_CRM_KEY, parseCrmFile(file));
}
