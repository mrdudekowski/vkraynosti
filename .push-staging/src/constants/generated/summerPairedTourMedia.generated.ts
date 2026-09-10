
import type { SummerContentSourceTourId } from '../../data/seasonTourRegistry';

export type TourMediaBundle = {
  imageUrl: string;
  galleryImages: readonly string[];
  galleryGridUrls: readonly string[];
  prefaceBackgroundImageUrl?: string;
  gridVideoPosters?: Record<string, string>;
  gridVideoPostersMobile?: Record<string, string>;
};

export const SUMMER_PAIRED_TOUR_MEDIA_BY_ID = {
  'summer-2': {
  "imageUrl": "/tours/summer-2/cover.webp",
  "galleryImages": [
    "/tours/summer-2/cover.webp",
    "/tours/summer-2/preface.webp",
    "/tours/summer-2/tob.clip1.poster.webp",
    "/tours/summer-2/1.webp",
    "/tours/summer-2/tob.clip2.poster.webp",
    "/tours/summer-2/2.webp",
    "/tours/summer-2/tob.clip3.poster.webp",
    "/tours/summer-2/3.webp",
    "/tours/summer-2/tob.clip4.poster.webp",
    "/tours/summer-2/4.webp",
    "/tours/summer-2/tob.clip5.poster.webp"
  ],
  "galleryGridUrls": [
    "/tours/summer-2/cover.webp",
    "/tours/summer-2/preface.webp",
    "/tours/summer-2/tob.clip1.grid.webm",
    "/tours/summer-2/1.webp",
    "/tours/summer-2/tob.clip2.grid.webm",
    "/tours/summer-2/2.webp",
    "/tours/summer-2/tob.clip3.grid.webm",
    "/tours/summer-2/3.webp",
    "/tours/summer-2/tob.clip4.grid.webm",
    "/tours/summer-2/4.webp",
    "/tours/summer-2/tob.clip5.grid.webm"
  ],
  "prefaceBackgroundImageUrl": "/tours/summer-2/preface.webp",
  "gridVideoPosters": {
    "/tours/summer-2/tob.clip1.grid.webm": "/tours/summer-2/tob.clip1.poster.webp",
    "/tours/summer-2/tob.clip2.grid.webm": "/tours/summer-2/tob.clip2.poster.webp",
    "/tours/summer-2/tob.clip3.grid.webm": "/tours/summer-2/tob.clip3.poster.webp",
    "/tours/summer-2/tob.clip4.grid.webm": "/tours/summer-2/tob.clip4.poster.webp",
    "/tours/summer-2/tob.clip5.grid.webm": "/tours/summer-2/tob.clip5.poster.webp"
  }
},
  'summer-3': {
  "imageUrl": "/tours/summer-3/hero.webp",
  "galleryImages": [
    "/tours/summer-3/view.webp",
    "/tours/summer-3/beach.webp",
    "/tours/summer-3/ask.intro.poster.webp",
    "/tours/summer-3/ask.clip2.poster.webp",
    "/tours/summer-3/ask.clip4.poster.webp",
    "/tours/summer-3/ask.clip5.poster.webp",
    "/tours/summer-3/ask.clip6.poster.webp",
    "/tours/summer-3/beacon.webp",
    "/tours/summer-3/rock.webp",
    "/tours/summer-3/view2.webp",
    "/tours/summer-3/view3.webp"
  ],
  "galleryGridUrls": [
    "/tours/summer-3/view.webp",
    "/tours/summer-3/beach.webp",
    "/tours/summer-3/ask.intro.grid.webm",
    "/tours/summer-3/ask.clip2.grid.webm",
    "/tours/summer-3/ask.clip4.grid.webm",
    "/tours/summer-3/ask.clip5.grid.webm",
    "/tours/summer-3/ask.clip6.grid.webm",
    "/tours/summer-3/beacon.webp",
    "/tours/summer-3/rock.webp",
    "/tours/summer-3/view2.webp",
    "/tours/summer-3/view3.webp"
  ],
  "prefaceBackgroundImageUrl": "/tours/summer-3/beach.webp",
  "gridVideoPosters": {
    "/tours/summer-3/ask.intro.grid.webm": "/tours/summer-3/ask.intro.poster.webp",
    "/tours/summer-3/ask.clip2.grid.webm": "/tours/summer-3/ask.clip2.poster.webp",
    "/tours/summer-3/ask.clip4.grid.webm": "/tours/summer-3/ask.clip4.poster.webp",
    "/tours/summer-3/ask.clip5.grid.webm": "/tours/summer-3/ask.clip5.poster.webp",
    "/tours/summer-3/ask.clip6.grid.webm": "/tours/summer-3/ask.clip6.poster.webp"
  },
  "gridVideoPostersMobile": {
    "/tours/summer-3/ask.intro.grid.webm": "/tours/summer-3/ask.intro.poster.webp",
    "/tours/summer-3/ask.clip2.grid.webm": "/tours/summer-3/ask.clip2.poster.mobile.webp",
    "/tours/summer-3/ask.clip4.grid.webm": "/tours/summer-3/ask.clip4.poster.mobile.webp",
    "/tours/summer-3/ask.clip5.grid.webm": "/tours/summer-3/ask.clip5.poster.mobile.webp",
    "/tours/summer-3/ask.clip6.grid.webm": "/tours/summer-3/ask.clip6.poster.mobile.webp"
  }
},
  'summer-4': {
  "imageUrl": "/tours/summer-4/hero.webp",
  "galleryImages": [
    "/tours/summer-4/hero.webp",
    "/tours/summer-4/view.webp",
    "/tours/summer-4/shk.clip1.poster.webp",
    "/tours/summer-4/view2.webp",
    "/tours/summer-4/view3.webp",
    "/tours/summer-4/shk.clip2.poster.webp",
    "/tours/summer-4/climb.webp",
    "/tours/summer-4/view4.webp",
    "/tours/summer-4/shk.clip3.poster.webp",
    "/tours/summer-4/view5.webp",
    "/tours/summer-4/view6.webp",
    "/tours/summer-4/wow.webp",
    "/tours/summer-4/scallops.webp",
    "/tours/summer-4/earchin.webp"
  ],
  "galleryGridUrls": [
    "/tours/summer-4/hero.webp",
    "/tours/summer-4/view.webp",
    "/tours/summer-4/shk.clip1.grid.webm",
    "/tours/summer-4/view2.webp",
    "/tours/summer-4/view3.webp",
    "/tours/summer-4/shk.clip2.grid.webm",
    "/tours/summer-4/climb.webp",
    "/tours/summer-4/view4.webp",
    "/tours/summer-4/shk.clip3.grid.webm",
    "/tours/summer-4/view5.webp",
    "/tours/summer-4/view6.webp",
    "/tours/summer-4/wow.webp",
    "/tours/summer-4/scallops.webp",
    "/tours/summer-4/earchin.webp"
  ],
  "prefaceBackgroundImageUrl": "/tours/summer-4/view.webp",
  "gridVideoPosters": {
    "/tours/summer-4/shk.clip1.grid.webm": "/tours/summer-4/shk.clip1.poster.webp",
    "/tours/summer-4/shk.clip2.grid.webm": "/tours/summer-4/shk.clip2.poster.webp",
    "/tours/summer-4/shk.clip3.grid.webm": "/tours/summer-4/shk.clip3.poster.webp"
  }
},
  'summer-5': {
  "imageUrl": "/tours/summer-5/cover.webp",
  "galleryImages": [
    "/tours/summer-5/cover.webp",
    "/tours/summer-5/preface.webp",
    "/tours/summer-5/gam.clip6.poster.webp",
    "/tours/summer-5/gam.clip1.poster.webp",
    "/tours/summer-5/gam.clip3.poster.webp",
    "/tours/summer-5/view7.webp",
    "/tours/summer-5/rocks.webp",
    "/tours/summer-5/gam.clip5.poster.webp",
    "/tours/summer-5/sosna2.webp",
    "/tours/summer-5/dve-sosna.webp",
    "/tours/summer-5/summit-view.webp",
    "/tours/summer-5/astafiev-bay.webp"
  ],
  "galleryGridUrls": [
    "/tours/summer-5/cover.webp",
    "/tours/summer-5/preface.webp",
    "/tours/summer-5/gam.clip6.grid.webm",
    "/tours/summer-5/gam.clip1.grid.webm",
    "/tours/summer-5/gam.clip3.grid.webm",
    "/tours/summer-5/view7.webp",
    "/tours/summer-5/rocks.webp",
    "/tours/summer-5/gam.clip5.grid.webm",
    "/tours/summer-5/sosna2.webp",
    "/tours/summer-5/dve-sosna.webp",
    "/tours/summer-5/summit-view.webp",
    "/tours/summer-5/astafiev-bay.webp"
  ],
  "prefaceBackgroundImageUrl": "/tours/summer-5/preface.webp",
  "gridVideoPosters": {
    "/tours/summer-5/gam.clip1.grid.webm": "/tours/summer-5/gam.clip1.poster.webp",
    "/tours/summer-5/gam.clip3.grid.webm": "/tours/summer-5/gam.clip3.poster.webp",
    "/tours/summer-5/gam.clip5.grid.webm": "/tours/summer-5/gam.clip5.poster.webp",
    "/tours/summer-5/gam.clip6.grid.webm": "/tours/summer-5/gam.clip6.poster.webp"
  }
},
  'summer-6': {
  "imageUrl": "/tours/summer-6/hero.webp",
  "galleryImages": [
    "/tours/summer-6/view.webp",
    "/tours/summer-6/view3.webp",
    "/tours/summer-6/ddn.clip1.poster.webp",
    "/tours/summer-6/view2.webp",
    "/tours/summer-6/ddn.clip2.poster.webp",
    "/tours/summer-6/yarchill.webp",
    "/tours/summer-6/exit2.webp",
    "/tours/summer-6/camp.webp"
  ],
  "galleryGridUrls": [
    "/tours/summer-6/view.webp",
    "/tours/summer-6/view3.webp",
    "/tours/summer-6/ddn.clip1.grid.webm",
    "/tours/summer-6/view2.webp",
    "/tours/summer-6/ddn.clip2.grid.webm",
    "/tours/summer-6/yarchill.webp",
    "/tours/summer-6/exit2.webp",
    "/tours/summer-6/camp.webp"
  ],
  "prefaceBackgroundImageUrl": "/tours/summer-6/view3.webp",
  "gridVideoPosters": {
    "/tours/summer-6/ddn.clip1.grid.webm": "/tours/summer-6/ddn.clip1.poster.webp",
    "/tours/summer-6/ddn.clip2.grid.webm": "/tours/summer-6/ddn.clip2.poster.webp"
  }
}
} as const satisfies Record<SummerContentSourceTourId, TourMediaBundle>;
