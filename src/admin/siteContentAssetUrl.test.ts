import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveSiteContentAssetUrl } from './siteContentAssetUrl';

describe('resolveSiteContentAssetUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it('keeps absolute CMS uploads and turns seed paths into CDN URLs', () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', '');
    expect(
      resolveSiteContentAssetUrl(
        'https://ypnmfvotln.cdn.twcstorage.ru/media/site-content/team/1ffaa643-b261-4cd1-aae1-4398c317298b.jpg',
      ),
    ).toBe(
      'https://ypnmfvotln.cdn.twcstorage.ru/media/site-content/team/1ffaa643-b261-4cd1-aae1-4398c317298b.jpg',
    );
    expect(resolveSiteContentAssetUrl('/team/team-1.webp')).toBe(
      'https://ypnmfvotln.cdn.twcstorage.ru/team/team-1.webp',
    );
  });

  it('keeps seed portraits on the public CMS CDN even when catalog S3 is set', () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://s3.twcstorage.ru/vkraynosti-cms-dev/');
    expect(resolveSiteContentAssetUrl('team/team-4.webp')).toBe(
      'https://ypnmfvotln.cdn.twcstorage.ru/team/team-4.webp',
    );
  });

  it('rewrites localhost legal PDFs to the public site', () => {
    expect(resolveSiteContentAssetUrl('http://localhost/legal/offer-and-safety.pdf')).toBe(
      'https://vkraynosti.ru/legal/offer-and-safety.pdf',
    );
  });
});
