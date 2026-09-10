const POSTER_SEEK_SEC = 0.1;
const POSTER_QUALITY = 0.86;

/**
 * Первый кадр ролика → JPEG-постер. Нужен, чтобы still в CMS оставался обязательным.
 */
export async function captureVideoPoster(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const video = window.document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        video.removeEventListener('loadeddata', onReady);
        video.removeEventListener('error', onError);
        resolve();
      };
      const onError = () => {
        video.removeEventListener('loadeddata', onReady);
        video.removeEventListener('error', onError);
        reject(new Error('video_poster_failed'));
      };
      video.addEventListener('loadeddata', onReady);
      video.addEventListener('error', onError);
    });
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const seekTo = duration > POSTER_SEEK_SEC ? POSTER_SEEK_SEC : 0;
    if (video.currentTime !== seekTo) {
      await new Promise<void>((resolve, reject) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          video.removeEventListener('error', onError);
          resolve();
        };
        const onError = () => {
          video.removeEventListener('seeked', onSeeked);
          video.removeEventListener('error', onError);
          reject(new Error('video_poster_failed'));
        };
        video.addEventListener('seeked', onSeeked);
        video.addEventListener('error', onError);
        video.currentTime = seekTo;
      });
    }
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (width < 1 || height < 1) {
      throw new Error('video_poster_failed');
    }
    const canvas = window.document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (context == null) {
      throw new Error('video_poster_failed');
    }
    context.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result == null) {
            reject(new Error('video_poster_failed'));
            return;
          }
          resolve(result);
        },
        'image/jpeg',
        POSTER_QUALITY,
      );
    });
    return new File([blob], 'poster.jpg', { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
