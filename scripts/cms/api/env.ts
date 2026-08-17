import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type CmsApiRole = 'admin' | 'editor';

export type CmsApiUser = {
  login: string;
  password: string;
  role: CmsApiRole;
};

export type CmsApiEnv = {
  port: number;
  authSecret: string;
  crmInboundSecret: string;
  users: CmsApiUser[];
  s3: {
    bucket: string;
    endpoint: string;
    region: string;
    accessKey: string;
    secretKey: string;
    forcePathStyle: boolean;
    publicBaseUrl: string;
  };
};

export async function readDotEnvFile(filePath: string): Promise<Record<string, string>> {
  const env: Record<string, string> = {};
  try {
    const text = await readFile(filePath, 'utf8');
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (line.length === 0 || line.startsWith('#') || !line.includes('=')) {
        continue;
      }
      const eq = line.indexOf('=');
      env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    /* optional */
  }
  return env;
}

export async function loadCmsApiEnv(rootDir: string): Promise<CmsApiEnv> {
  const fileEnv = await readDotEnvFile(path.join(rootDir, '.env.cms-dev'));
  const get = (key: string): string => fileEnv[key] ?? process.env[key] ?? '';

  const adminLogin = get('CMS_ADMIN_LOGIN');
  const adminPassword = get('CMS_ADMIN_PASSWORD');
  const editorLogin = get('CMS_EDITOR_LOGIN');
  const editorPassword = get('CMS_EDITOR_PASSWORD');
  const users: CmsApiUser[] = [];
  if (adminLogin.length > 0 && adminPassword.length > 0) {
    users.push({ login: adminLogin, password: adminPassword, role: 'admin' });
  }
  if (editorLogin.length > 0 && editorPassword.length > 0) {
    users.push({ login: editorLogin, password: editorPassword, role: 'editor' });
  }

  const authSecret = get('CMS_AUTH_SECRET');
  const accessKey = get('S3_ACCESS_KEY') || get('AWS_ACCESS_KEY_ID');
  const secretKey = get('S3_SECRET_KEY') || get('AWS_SECRET_ACCESS_KEY');
  const bucket = get('S3_BUCKET');
  const endpoint = get('S3_ENDPOINT') || get('AWS_ENDPOINT_URL') || 'https://s3.twcstorage.ru';

  if (users.length === 0) {
    throw new Error('CMS_ADMIN_LOGIN/PASSWORD or CMS_EDITOR_LOGIN/PASSWORD missing in .env.cms-dev');
  }
  if (authSecret.length < 16) {
    throw new Error('CMS_AUTH_SECRET must be at least 16 characters');
  }
  if (accessKey.length === 0 || secretKey.length === 0 || bucket.length === 0) {
    throw new Error('S3 keys/bucket missing in .env.cms-dev');
  }

  const portRaw = process.env.CMS_API_PORT || get('CMS_API_PORT');
  const port = portRaw.length > 0 ? Number.parseInt(portRaw, 10) : 8787;
  const publicBaseUrl = (
    get('S3_PUBLIC_BASE_URL') || `${endpoint.replace(/\/+$/, '')}/${bucket}/`
  ).replace(/\/+$/, '');

  return {
    port: Number.isFinite(port) ? port : 8787,
    authSecret,
    crmInboundSecret: get('CMS_CRM_INBOUND_SECRET'),
    users,
    s3: {
      bucket,
      endpoint,
      region: get('S3_REGION') || 'ru-1',
      accessKey,
      secretKey,
      forcePathStyle: get('S3_FORCE_PATH_STYLE') !== 'false',
      publicBaseUrl,
    },
  };
}
