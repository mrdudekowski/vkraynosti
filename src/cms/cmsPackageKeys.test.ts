import { describe, expect, it } from 'vitest';
import {
  assertCmsTourId,
  cmsDraftDocumentKey,
  cmsDraftMetaKey,
  cmsMediaObjectKey,
  cmsMediaObjectKeyFromPublicUrl,
  cmsMediaPrefix,
  cmsPublishedDocumentKey,
  CMS_USERS_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
  CMS_PUBLISHED_SCHEDULE_KEY,
} from './cmsPackageKeys';

describe('cmsPackageKeys', () => {
  it('собирает ключи пакета по id', () => {
    expect(cmsDraftDocumentKey('summer-8')).toBe('draft/tours/summer-8/document.json');
    expect(cmsDraftMetaKey('summer-8')).toBe('draft/tours/summer-8/meta.json');
    expect(cmsPublishedDocumentKey('spring-10')).toBe(
      'published/tours/spring-10/document.json'
    );
    expect(cmsMediaPrefix('winter-1')).toBe('media/tours/winter-1');
    expect(cmsMediaObjectKey('winter-1', 'u-1.webp')).toBe('media/tours/winter-1/u-1.webp');
    expect(cmsMediaObjectKeyFromPublicUrl(
      'winter-1',
      'https://s3.example/vkraynosti-cms-dev/media/tours/winter-1/u-1.webp'
    )).toBe('media/tours/winter-1/u-1.webp');
    expect(cmsMediaObjectKeyFromPublicUrl('winter-1', 'https://cdn.example/cover.webp')).toBeNull();
    expect(CMS_USERS_KEY).toBe('private/users.json');
    expect(CMS_PUBLISHED_TOURS_LIST_KEY).toBe('published/tour-schedule/tours_list.json');
    expect(CMS_PUBLISHED_SCHEDULE_KEY).toBe('published/tour-schedule/schedule.json');
  });

  it('отклоняет id с путём', () => {
    expect(() => assertCmsTourId('../secret')).toThrow(/Invalid CMS tour id/);
    expect(() => cmsMediaObjectKey('winter-1', '../x.webp')).toThrow(/Invalid CMS media file name/);
  });
});
