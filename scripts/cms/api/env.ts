import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type CmsApiRole = 'admin' | 'editor';

export type CmsApiUser = {
  login: string;
  password: string;
  role: CmsApiRole;
};

export type CmsStoreKind = 's3' | 'filesystem';

export type CmsApiS3Config = {
  bucket: string;
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  forcePathStyle: boolean;
  publicBaseUrl: string;
};

export type CmsApiEnv = {
  port: number;
  authSecret: string;
  cookieSecure: boolean;
  crmInboundSecret: string;
  users: CmsApiUser[];
  storeKind: CmsStoreKind;
  localStoreDir: string;
  s3: CmsApiS3Config;
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
  const accessKeyId = get('AWS_ACCESS_KEY_ID');
  const secretAccessKey = get('AWS_SECRET_ACCESS_KEY');
  const s3AccessKey = get('S3_ACCESS_KEY');
  const s3SecretKey = get('S3_SECRET_KEY');
  const bucket = get('S3_BUCKET');
  const endpoint = get('S3_ENDPOINT') || get('AWS_ENDPOINT_URL') || 'https://s3.twcstorage.ru';

  let accessKey = '';
  let secretKey = '';
  if (s3AccessKey.length > 0 && s3SecretKey.length > 0) {
    accessKey = s3AccessKey;
    secretKey = s3SecretKey;
  } else if (accessKeyId.length > 0 && secretAccessKey.length > 0) {
    accessKey = accessKeyId;
    secretKey = secretAccessKey;
  } else if (s3AccessKey.length > 0) {
    accessKey = s3AccessKey;
    secretKey = s3SecretKey;
  } else {
    accessKey = accessKeyId;
    secretKey = secretAccessKey;
  }

  if (users.length === 0) {
    throw new Error('CMS_ADMIN_LOGIN/PASSWORD or CMS_EDITOR_LOGIN/PASSWORD missing in .env.cms-dev');
  }
  if (authSecret.length < 16) {
    throw new Error('CMS_AUTH_SECRET must be at least 16 characters');
  }
  const storeKindRaw = get('CMS_STORE').toLowerCase();
  const storeKind: CmsStoreKind =
    storeKindRaw === 'filesystem' || storeKindRaw === 'local' ? 'filesystem' : 's3';
  const localStoreDir = path.resolve(
    rootDir,
    get('CMS_LOCAL_STORE_DIR') || 'tmp/cms-catalog'
  );

  if (storeKind === 's3' && (accessKey.length === 0 || secretKey.length === 0 || bucket.length === 0)) {
    throw new Error('S3 keys/bucket missing in .env.cms-dev (or set CMS_STORE=filesystem)');
  }

  const portRaw = process.env.CMS_API_PORT || get('CMS_API_PORT');
  const port = portRaw.length > 0 ? Number.parseInt(portRaw, 10) : 8787;
  const publicBaseUrl = (
    get('S3_PUBLIC_BASE_URL') ||
    (bucket.length > 0
      ? `${endpoint.replace(/\/+$/, '')}/${bucket}/`
      : 'http://127.0.0.1:5173/')
  ).replace(/\/+$/, '');

  return {
    port: Number.isFinite(port) ? port : 8787,
    authSecret,
    cookieSecure: get('CMS_COOKIE_SECURE') === 'true',
    crmInboundSecret: get('CMS_CRM_INBOUND_SECRET'),
    users,
    storeKind,
    localStoreDir,
    s3: {
      bucket: bucket.length > 0 ? bucket : 'local-cms-catalog',
      endpoint,
      region: get('S3_REGION') || 'ru-1',
      accessKey,
      secretKey,
      forcePathStyle: get('S3_FORCE_PATH_STYLE') !== 'false',
      publicBaseUrl,
    },
  };
}
