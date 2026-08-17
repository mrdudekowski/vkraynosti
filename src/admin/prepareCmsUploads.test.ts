import { describe, expect, it } from 'vitest';
import { classifyCmsMediaFile, prepareCmsUploads } from './prepareCmsUploads';

describe('classifyCmsMediaFile', () => {
  it('отличает фото, видео и мусор', () => {
    expect(classifyCmsMediaFile(new File([], 'a.webp', { type: 'image/webp' }))).toBe('still');
    expect(classifyCmsMediaFile(new File([], 'a.webm', { type: 'video/webm' }))).toBe('video');
    expect(classifyCmsMediaFile(new File([], 'a.gif', { type: 'image/gif' }))).toBe('reject');
    expect(classifyCmsMediaFile(new File([], 'shot.webp'))).toBe('still');
    expect(classifyCmsMediaFile(new File([], 'clip.webm'))).toBe('video');
  });
});

describe('prepareCmsUploads', () => {
  it('фото идёт как still, видео получает постер', async () => {
    const poster = new File([new Uint8Array([1])], 'poster.jpg', { type: 'image/jpeg' });
    const photo = new File([new Uint8Array([2])], 'shot.webp', { type: 'image/webp' });
    const video = new File([new Uint8Array([3])], 'clip.webm', { type: 'video/webm' });
    const prepared = await prepareCmsUploads([photo, video], async () => poster);
    expect(prepared).toHaveLength(2);
    expect(prepared[0]?.still).toBe(photo);
    expect(prepared[0]?.video).toBeNull();
    expect(prepared[1]?.still).toBe(poster);
    expect(prepared[1]?.video).toBe(video);
  });
});
