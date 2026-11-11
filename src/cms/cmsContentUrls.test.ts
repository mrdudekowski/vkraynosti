import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildCmsPublishedScheduleUrl,
  buildCmsPublishedSiteContentUrl,
  buildCmsPublishedToursListUrl,
  buildCmsPublishedToursUrl,
  cmsPublishedSiteContentCandidates,
  cmsTourScheduleOverlayCandidates,
  resolveCmsContentBaseUrl,
} from './cmsContentUrls';

describe('resolveCmsContentBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('пустой env → CMS выключен', () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', '');
    expect(resolveCmsContentBaseUrl()).toBeNull();
  });

  it('нормализует origin без завершающего слэша', () => {
    vi.stubEnv(
      'VITE_CMS_S3_BASE_URL',
      'https://s3.twcstorage.ru/vkraynosti-cms-dev/'
    );
    expect(resolveCmsContentBaseUrl()).toBe(
      'https://s3.twcstorage.ru/vkraynosti-cms-dev'
    );
    expect(
      buildCmsPublishedToursUrl('https://s3.twcstorage.ru/vkraynosti-cms-dev')
    ).toBe('https://s3.twcstorage.ru/vkraynosti-cms-dev/published/tours.json');
    expect(
      buildCmsPublishedToursListUrl('https://s3.twcstorage.ru/vkraynosti-cms-dev')
    ).toBe(
      'https://s3.twcstorage.ru/vkraynosti-cms-dev/published/tour-schedule/tours_list.json'
    );
    expect(
      buildCmsPublishedScheduleUrl('https://s3.twcstorage.ru/vkraynosti-cms-dev')
    ).toBe(
      'https://s3.twcstorage.ru/vkraynosti-cms-dev/published/tour-schedule/schedule.json'
    );
  });

  it('календарный overlay всегда same-origin, даже без CMS env', () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', '');
    vi.stubEnv('BASE_URL', '/');
    const candidates = cmsTourScheduleOverlayCandidates();
    expect(candidates.toursList[0]).toBe('/data/cms/tour-schedule/tours_list.json');
    expect(candidates.schedule[0]).toBe('/data/cms/tour-schedule/schedule.json');
  });

  it('календарный overlay остаётся привязан к снимку текущего деплоя', () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    vi.stubEnv('BASE_URL', '/');
    const candidates = cmsTourScheduleOverlayCandidates();
    expect(candidates.toursList).toEqual(['/data/cms/tour-schedule/tours_list.json']);
    expect(candidates.schedule).toEqual(['/data/cms/tour-schedule/schedule.json']);
  });

  it('site content remains on the release baked into this deployment', () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    vi.stubEnv('BASE_URL', '/');
    expect(cmsPublishedSiteContentCandidates('modal')).toEqual(['/data/cms/site-content/modal/document.json']);
    expect(buildCmsPublishedSiteContentUrl('https://cdn.example/cms/', 'modal')).toBe(
      'https://cdn.example/cms/published/site-content/modal/document.json',
    );
  });

  it('keeps SEO on the same-origin bake so the first HTML matches hydration', () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    vi.stubEnv('BASE_URL', '/');
    expect(cmsPublishedSiteContentCandidates('seo')).toEqual(['/data/cms/site-seo/document.json']);
  });
});
