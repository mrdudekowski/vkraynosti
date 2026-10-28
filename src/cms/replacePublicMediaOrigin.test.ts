import { describe, expect, it } from 'vitest';
import { replacePublicMediaOrigin } from './replacePublicMediaOrigin';

const FROM = 'https://s3.twcstorage.ru/vkraynosti-cms-dev';
const TO = 'https://ypnmfvotln.cdn.twcstorage.ru';

describe('replacePublicMediaOrigin', () => {
  it('rewrites nested stillUrl and videoUrl and leaves other strings', () => {
    const input = {
      stillUrl: `${FROM}/media/tours/fall-1/cover.webp`,
      videoUrl: `${FROM}/media/tours/fall-1/clip.webm`,
      title: 'fall-1',
      assets: [{ stillUrl: `${TO}/media/tours/fall-12/cover.webp` }],
    };
    const { value, replacements } = replacePublicMediaOrigin(input, FROM, TO);
    expect(replacements).toBe(2);
    expect(value).toEqual({
      stillUrl: `${TO}/media/tours/fall-1/cover.webp`,
      videoUrl: `${TO}/media/tours/fall-1/clip.webm`,
      title: 'fall-1',
      assets: [{ stillUrl: `${TO}/media/tours/fall-12/cover.webp` }],
    });
  });

  it('is idempotent when the old prefix is absent', () => {
    const input = { stillUrl: `${TO}/media/tours/fall-12/cover.webp` };
    const first = replacePublicMediaOrigin(input, FROM, TO);
    const second = replacePublicMediaOrigin(first.value, FROM, TO);
    expect(first.replacements).toBe(0);
    expect(second.replacements).toBe(0);
    expect(second.value).toEqual(input);
  });
});
