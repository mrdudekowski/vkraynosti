export const CMS_STILL_MAX_BYTES = 12 * 1024 * 1024;
export const CMS_VIDEO_MAX_BYTES = 40 * 1024 * 1024;

export const CMS_STILL_ACCEPT = 'image/webp,image/jpeg,image/png';
export const CMS_VIDEO_ACCEPT = 'video/webm,video/mp4';
export const CMS_MEDIA_ACCEPT = `${CMS_STILL_ACCEPT},${CMS_VIDEO_ACCEPT}`;

const STILL_EXT: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const VIDEO_EXT: Record<string, string> = {
  'video/webm': 'webm',
  'video/mp4': 'mp4',
};

export function stillExtensionForMime(mime: string): string | null {
  return STILL_EXT[mime] ?? null;
}

export function videoExtensionForMime(mime: string): string | null {
  return VIDEO_EXT[mime] ?? null;
}
