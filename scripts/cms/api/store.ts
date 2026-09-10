import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { CmsApiEnv, CmsApiS3Config } from './env';

export type CmsJsonStore = {
  getJson: (key: string) => Promise<unknown | null>;
  putJson: (key: string, value: unknown) => Promise<void>;
  putBytes: (key: string, body: Uint8Array, contentType: string) => Promise<void>;
  deleteBytes: (key: string) => Promise<void>;
};

export function createMemoryJsonStore(
  initial: Record<string, unknown> = {}
): CmsJsonStore {
  const data = new Map<string, unknown>(Object.entries(initial));
  const bytes = new Map<string, Uint8Array>();
  return {
    async getJson(key) {
      return data.has(key) ? data.get(key)! : null;
    },
    async putJson(key, value) {
      data.set(key, value);
    },
    async putBytes(key, body) {
      bytes.set(key, body);
    },
    async deleteBytes(key) {
      bytes.delete(key);
    },
  };
}

export function createS3JsonStore(env: CmsApiS3Config): CmsJsonStore {
  const client = new S3Client({
    region: env.region,
    endpoint: env.endpoint,
    forcePathStyle: env.forcePathStyle,
    credentials: {
      accessKeyId: env.accessKey,
      secretAccessKey: env.secretKey,
    },
  });

  return {
    async getJson(key) {
      try {
        const response = await client.send(
          new GetObjectCommand({ Bucket: env.bucket, Key: key })
        );
        const text = await response.Body?.transformToString();
        if (text == null || text.length === 0) {
          return null;
        }
        return JSON.parse(text) as unknown;
      } catch (error) {
        if (
          error != null &&
          typeof error === 'object' &&
          (('name' in error && error.name === 'NoSuchKey') ||
            ('$metadata' in error &&
              typeof error.$metadata === 'object' &&
              error.$metadata != null &&
              'httpStatusCode' in error.$metadata &&
              error.$metadata.httpStatusCode === 404))
        ) {
          return null;
        }
        throw error;
      }
    },
    async putJson(key, value) {
      await client.send(
        new PutObjectCommand({
          Bucket: env.bucket,
          Key: key,
          Body: `${JSON.stringify(value, null, 2)}\n`,
          ContentType: 'application/json; charset=utf-8',
          CacheControl: key.startsWith('published/')
            ? 'public, max-age=60'
            : 'private, no-store',
        })
      );
    },
    async putBytes(key, body, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: env.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: 'public, max-age=86400',
        })
      );
    },
    async deleteBytes(key) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: env.bucket,
          Key: key,
        })
      );
    },
  };
}

function resolveFilesystemKey(rootDir: string, key: string): string {
  const root = path.resolve(rootDir);
  const filePath = path.resolve(root, key.split('/').join(path.sep));
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Invalid CMS store key: ${key}`);
  }
  return filePath;
}

export function createFilesystemJsonStore(rootDir: string): CmsJsonStore {
  const root = path.resolve(rootDir);

  return {
    async getJson(key) {
      const filePath = resolveFilesystemKey(root, key);
      try {
        const text = await readFile(filePath, 'utf8');
        return JSON.parse(text) as unknown;
      } catch (error) {
        if (
          error != null &&
          typeof error === 'object' &&
          'code' in error &&
          error.code === 'ENOENT'
        ) {
          return null;
        }
        throw error;
      }
    },
    async putJson(key, value) {
      const filePath = resolveFilesystemKey(root, key);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    },
    async putBytes(key, body) {
      const filePath = resolveFilesystemKey(root, key);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, body);
    },
    async deleteBytes(key) {
      const filePath = resolveFilesystemKey(root, key);
      try {
        await unlink(filePath);
      } catch (error) {
        if (
          error != null &&
          typeof error === 'object' &&
          'code' in error &&
          error.code === 'ENOENT'
        ) {
          return;
        }
        throw error;
      }
    },
  };
}

export function createCmsJsonStore(env: CmsApiEnv): CmsJsonStore {
  if (env.storeKind === 'filesystem') {
    return createFilesystemJsonStore(env.localStoreDir);
  }
  return createS3JsonStore(env.s3);
}
