import { describe, expect, it, vi } from 'vitest';
import { validateCmsRuntimeBase, validateCmsRuntimeCors } from './validateCmsRuntimeBase.mjs';

describe('validateCmsRuntimeBase', () => {
  it('rejects a missing CMS URL', () => {
    expect(() => validateCmsRuntimeBase({})).toThrow('VITE_CMS_S3_BASE_URL is required');
  });

  it('requires HTTPS and normalizes trailing slashes', () => {
    expect(() => validateCmsRuntimeBase({ VITE_CMS_S3_BASE_URL: 'http://cms.example.test' }))
      .toThrow('must use HTTPS');
    expect(validateCmsRuntimeBase({ VITE_CMS_S3_BASE_URL: 'https://cms.example.test/base/' }))
      .toBe('https://cms.example.test/base');
  });

  it('requires the CMS endpoint to allow browser reads from the public site', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', {
      headers: { 'access-control-allow-origin': 'https://vkraynosti.ru' },
    }));
    await expect(validateCmsRuntimeCors({ VITE_CMS_S3_BASE_URL: 'https://cms.example.test' }, fetchImpl))
      .resolves.toBe('https://cms.example.test');
  });

  it('rejects an endpoint without a CORS allow-origin header', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}'));
    await expect(validateCmsRuntimeCors({ VITE_CMS_S3_BASE_URL: 'https://s3.example.test/bucket' }, fetchImpl))
      .rejects.toThrow('no CORS header');
  });
});
