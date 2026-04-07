/** Расширения видеофайлов в URL галереи туров (путь или полный URL). */
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov)(\?|#|$)/i;

export function isVideoAssetUrl(url: string): boolean {
  return VIDEO_EXTENSIONS.test(url);
}
