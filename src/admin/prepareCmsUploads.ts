import {
  stillExtensionForMime,
  videoExtensionForMime,
} from '../cms/cmsMediaAccept';
import { captureVideoPoster } from './captureVideoPoster';

export type PreparedCmsUpload = {
  still: File;
  video: File | null;
};

function mimeFromFile(file: File): string {
  if (file.type.length > 0) {
    return file.type;
  }
  const name = file.name.toLowerCase();
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.heic')) return 'image/heic';
  if (name.endsWith('.heif')) return 'image/heif';
  if (name.endsWith('.webm')) return 'video/webm';
  if (name.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
}

export function classifyCmsMediaFile(file: File): 'still' | 'video' | 'reject' {
  const mime = mimeFromFile(file);
  if (stillExtensionForMime(mime) != null) {
    return 'still';
  }
  if (videoExtensionForMime(mime) != null) {
    return 'video';
  }
  return 'reject';
}

export async function prepareCmsUploads(
  files: File[],
  capturePoster: (file: File) => Promise<File> = captureVideoPoster,
): Promise<PreparedCmsUpload[]> {
  const prepared: PreparedCmsUpload[] = [];
  for (const file of files) {
    const kind = classifyCmsMediaFile(file);
    if (kind === 'still') {
      prepared.push({ still: file, video: null });
      continue;
    }
    if (kind === 'video') {
      const still = await capturePoster(file);
      prepared.push({ still, video: file });
    }
  }
  return prepared;
}
