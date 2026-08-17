import { CMS_USERS_KEY } from '../../../src/cms/cmsPackageKeys.ts';
import {
  parseCmsUsersFile,
  type CmsUsersFile,
} from '../../../src/cms/cmsUsers.ts';
import type { CmsApiEnv } from './env.ts';
import { hashCmsPassword } from './password.ts';
import type { CmsJsonStore } from './store.ts';

export async function loadOrSeedCmsUsers(
  store: CmsJsonStore,
  env: CmsApiEnv
): Promise<CmsUsersFile> {
  const raw = await store.getJson(CMS_USERS_KEY);
  if (raw != null) {
    return parseCmsUsersFile(raw);
  }
  const file = parseCmsUsersFile({
    schemaVersion: 1,
    users: env.users.map((user) => ({
      login: user.login,
      password: hashCmsPassword(user.password),
      role: user.role,
    })),
  });
  await store.putJson(CMS_USERS_KEY, file);
  return file;
}

export async function saveCmsUsers(store: CmsJsonStore, file: CmsUsersFile): Promise<void> {
  await store.putJson(CMS_USERS_KEY, parseCmsUsersFile(file));
}
