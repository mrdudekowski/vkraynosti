import { z } from 'zod';

export const CMS_USERS_SCHEMA_VERSION = 1 as const;
export const CMS_USER_LOGIN_PATTERN = /^[a-zA-Z0-9_-]{2,32}$/;
export const CMS_PASSWORD_MIN_LENGTH = 8;

export const cmsUserRecordSchema = z.object({
  login: z.string().regex(CMS_USER_LOGIN_PATTERN),
  password: z.string().min(1),
  role: z.enum(['admin', 'editor']),
});

export const cmsUsersFileSchema = z.object({
  schemaVersion: z.literal(CMS_USERS_SCHEMA_VERSION),
  users: z.array(cmsUserRecordSchema).min(1),
});

export type CmsUserRecord = z.infer<typeof cmsUserRecordSchema>;
export type CmsUsersFile = z.infer<typeof cmsUsersFileSchema>;
export type CmsUserPublic = Pick<CmsUserRecord, 'login' | 'role'>;

export function parseCmsUsersFile(input: unknown): CmsUsersFile {
  return cmsUsersFileSchema.parse(input);
}

export function publicCmsUsers(file: CmsUsersFile): CmsUserPublic[] {
  return file.users.map((user) => ({ login: user.login, role: user.role }));
}

export function countCmsAdmins(file: CmsUsersFile): number {
  return file.users.filter((user) => user.role === 'admin').length;
}

export function findCmsUser(file: CmsUsersFile, login: string): CmsUserRecord | undefined {
  return file.users.find((user) => user.login === login);
}
