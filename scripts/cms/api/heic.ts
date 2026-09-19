const HEIC_MIME_TYPES = new Set(['image/heic', 'image/heif']);

export function isHeicStill(file: File): boolean {
  const mime = file.type.trim().toLowerCase();
  if (HEIC_MIME_TYPES.has(mime)) return true;
  const name = file.name.trim().toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

export async function convertHeicToJpeg(bytes: Uint8Array): Promise<Uint8Array> {
  const module = await import('heic-convert');
  const convert = module.default ?? module;
  const output = await convert({ buffer: bytes, format: 'JPEG', quality: 0.9 });
  return output instanceof Uint8Array ? output : new Uint8Array(output);
}

export type CmsImageUploadResult =
  | { ok: true; bytes: Uint8Array; mimeType: string; extension: string }
  | { ok: false; error: 'heic_conversion_failed' | 'invalid_type' };

export async function prepareCmsImageUpload(
  file: File,
  extensionForMime: (mime: string) => string | null,
  convert: (bytes: Uint8Array) => Promise<Uint8Array> = convertHeicToJpeg,
): Promise<CmsImageUploadResult> {
  if (isHeicStill(file)) {
    try {
      const bytes = await convert(new Uint8Array(await file.arrayBuffer()));
      return { ok: true, bytes, mimeType: 'image/jpeg', extension: 'jpg' };
    } catch {
      return { ok: false, error: 'heic_conversion_failed' };
    }
  }
  const mimeType = file.type.trim().toLowerCase() || 'application/octet-stream';
  const extension = extensionForMime(mimeType);
  if (extension == null) {
    return { ok: false, error: 'invalid_type' };
  }
  return {
    ok: true,
    bytes: new Uint8Array(await file.arrayBuffer()),
    mimeType,
    extension,
  };
}
