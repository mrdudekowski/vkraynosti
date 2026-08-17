import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildCmsPublishedScheduleUrl,
  buildCmsPublishedToursListUrl,
  buildCmsPublishedToursUrl,
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

  it('календарный overlay пуст без CMS env', () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', '');
    expect(cmsTourScheduleOverlayCandidates()).toEqual({ toursList: [], schedule: [] });
  });

  it('календарный overlay начинается с published/tour-schedule', () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://s3.twcstorage.ru/vkraynosti-cms-dev/');
    vi.stubEnv('BASE_URL', '/');
    const candidates = cmsTourScheduleOverlayCandidates();
    expect(candidates.toursList[0]).toBe(
      'https://s3.twcstorage.ru/vkraynosti-cms-dev/published/tour-schedule/tours_list.json'
    );
    expect(candidates.schedule[0]).toBe(
      'https://s3.twcstorage.ru/vkraynosti-cms-dev/published/tour-schedule/schedule.json'
    );
  });
});
