const TOUR_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export function assertCmsTourId(tourId: string): string {
  if (!TOUR_ID_PATTERN.test(tourId)) {
    throw new Error(`Invalid CMS tour id: ${tourId}`);
  }
  return tourId;
}

export const CMS_PUBLISHED_CATALOG_KEY = 'published/tours.json' as const;
export const CMS_DRAFT_INDEX_KEY = 'draft/tours-index.json' as const;
export const CMS_LEGACY_DRAFT_CATALOG_KEY = 'draft/tours.json' as const;
export const CMS_USERS_KEY = 'private/users.json' as const;
export const CMS_CRM_KEY = 'private/crm.json' as const;
export const CMS_PUBLISHED_TOURS_LIST_KEY = 'published/tour-schedule/tours_list.json' as const;
export const CMS_PUBLISHED_SCHEDULE_KEY = 'published/tour-schedule/schedule.json' as const;

export function cmsDraftDocumentKey(tourId: string): string {
  return `draft/tours/${assertCmsTourId(tourId)}/document.json`;
}

export function cmsDraftMetaKey(tourId: string): string {
  return `draft/tours/${assertCmsTourId(tourId)}/meta.json`;
}

export function cmsPublishedDocumentKey(tourId: string): string {
  return `published/tours/${assertCmsTourId(tourId)}/document.json`;
}

export function cmsMediaPrefix(tourId: string): string {
  return `media/tours/${assertCmsTourId(tourId)}`;
}

const MEDIA_FILE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/i;

export function cmsMediaObjectKey(tourId: string, fileName: string): string {
  if (!MEDIA_FILE_NAME.test(fileName)) {
    throw new Error(`Invalid CMS media file name: ${fileName}`);
  }
  return `${cmsMediaPrefix(tourId)}/${fileName}`;
}

/** Достаёт object key из public URL кадра тура. Чужой путь или имя — `null`. */
export function cmsMediaObjectKeyFromPublicUrl(tourId: string, url: string): string | null {
  const expectedPrefix = `/${cmsMediaPrefix(tourId)}/`;
  try {
    const pathname = new URL(url).pathname;
    const start = pathname.indexOf('/media/tours/');
    if (start === -1) {
      return null;
    }
    const rest = pathname.slice(start);
    if (!rest.startsWith(expectedPrefix)) {
      return null;
    }
    const fileName = rest.slice(expectedPrefix.length);
    if (fileName.includes('/')) {
      return null;
    }
    return cmsMediaObjectKey(tourId, fileName);
  } catch {
    return null;
  }
}
