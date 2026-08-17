import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { CmsApiEnv } from './env';

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

export function createS3JsonStore(env: CmsApiEnv['s3']): CmsJsonStore {
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
