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
