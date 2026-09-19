import { isHeicCmsFile } from './prepareCmsUploads';

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);
const PDF_MIME = 'application/pdf';

export const SITE_CONTENT_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/svg+xml,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.svg,.heic,.heif';
export const SITE_CONTENT_PDF_ACCEPT = 'application/pdf,.pdf';

const fileName = (file: File) => file.name.toLowerCase();

export function isSiteContentImageFile(file: File): boolean {
  if (isHeicCmsFile(file)) {
    return true;
  }
  const mime = file.type.toLowerCase();
  if (IMAGE_MIMES.has(mime)) {
    return true;
  }
  if (mime.length > 0) {
    return false;
  }
  const name = fileName(file);
  return (
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp') ||
    name.endsWith('.svg')
  );
}

export function isSiteContentPdfFile(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (mime === PDF_MIME) {
    return true;
  }
  if (mime.length > 0) {
    return false;
  }
  return fileName(file).endsWith('.pdf');
}
