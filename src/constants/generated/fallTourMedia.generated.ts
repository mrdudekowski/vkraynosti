
import type { FallTourId } from '../fallTourImages';

export type TourMediaBundle = {
  imageUrl: string;
  galleryImages: readonly string[];
  galleryGridUrls: readonly string[];
  prefaceBackgroundImageUrl?: string;
  gridVideoPosters?: Record<string, string>;
  gridVideoPostersMobile?: Record<string, string>;
};

export const FALL_TOUR_MEDIA_BY_ID = {
  'fall-1': {
  "imageUrl": "/tours/fall-1/cover.webp",
  "galleryImages": [
    "/tours/fall-1/ld.hero.webp",
    "/tours/fall-1/ld.preface.webp",
    "/tours/fall-1/ld.descent.webp",
    "/tours/fall-1/ld.ridge.webp",
    "/tours/fall-1/ld.summit.webp",
    "/tours/fall-1/ld.approach.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-1/ld.hero.webp",
    "/tours/fall-1/ld.preface.webp",
    "/tours/fall-1/ld.descent.webp",
    "/tours/fall-1/ld.ridge.webp",
    "/tours/fall-1/ld.summit.webp",
    "/tours/fall-1/ld.approach.webp"
  ]
},
  'fall-2': {
  "imageUrl": "/tours/fall-2/cover.webp",
  "galleryImages": [
    "/tours/fall-2/olv.hero.webp",
    "/tours/fall-2/olv.preface.webp",
    "/tours/fall-2/olv.lake1.webp",
    "/tours/fall-2/olv.ridge.webp",
    "/tours/fall-2/olv.summit.webp",
    "/tours/fall-2/olv.clip1.poster.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-2/olv.hero.webp",
    "/tours/fall-2/olv.preface.webp",
    "/tours/fall-2/olv.lake1.webp",
    "/tours/fall-2/olv.ridge.webp",
    "/tours/fall-2/olv.summit.webp",
    "/tours/fall-2/olv.clip1.grid.webm"
  ],
  "gridVideoPosters": {
    "/tours/fall-2/olv.clip1.grid.webm": "/tours/fall-2/olv.clip1.poster.webp"
  }
},
  'fall-3': {
  "imageUrl": "/tours/fall-3/cover.webp",
  "galleryImages": [
    "/tours/fall-3/pd.hero.webp",
    "/tours/fall-3/pd.preface.webp",
    "/tours/fall-3/pd.group.webp",
    "/tours/fall-3/pd.clip3.poster.webp",
    "/tours/fall-3/pd.clip2.poster.webp",
    "/tours/fall-3/pd.ridge.webp",
    "/tours/fall-3/pd.clip5.poster.webp",
    "/tours/fall-3/pd.summit.webp",
    "/tours/fall-3/pd.clip4.poster.webp",
    "/tours/fall-3/pd.sea.webp",
    "/tours/fall-3/pd.taiga.webp",
    "/tours/fall-3/pd.clip6.poster.webp",
    "/tours/fall-3/pd.clip7.poster.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-3/pd.hero.webp",
    "/tours/fall-3/pd.preface.webp",
    "/tours/fall-3/pd.group.webp",
    "/tours/fall-3/pd.clip3.grid.webm",
    "/tours/fall-3/pd.clip2.grid.webm",
    "/tours/fall-3/pd.ridge.webp",
    "/tours/fall-3/pd.clip5.grid.webm",
    "/tours/fall-3/pd.summit.webp",
    "/tours/fall-3/pd.clip4.grid.webm",
    "/tours/fall-3/pd.sea.webp",
    "/tours/fall-3/pd.taiga.webp",
    "/tours/fall-3/pd.clip6.grid.webm",
    "/tours/fall-3/pd.clip7.grid.webm"
  ],
  "prefaceBackgroundImageUrl": "/tours/fall-3/pd.hero.webp",
  "gridVideoPosters": {
    "/tours/fall-3/pd.clip3.grid.webm": "/tours/fall-3/pd.clip3.poster.webp",
    "/tours/fall-3/pd.clip2.grid.webm": "/tours/fall-3/pd.clip2.poster.webp",
    "/tours/fall-3/pd.clip5.grid.webm": "/tours/fall-3/pd.clip5.poster.webp",
    "/tours/fall-3/pd.clip4.grid.webm": "/tours/fall-3/pd.clip4.poster.webp",
    "/tours/fall-3/pd.clip6.grid.webm": "/tours/fall-3/pd.clip6.poster.webp",
    "/tours/fall-3/pd.clip7.grid.webm": "/tours/fall-3/pd.clip7.poster.webp"
  }
},
  'fall-4': {
  "imageUrl": "/tours/fall-4/cover.webp",
  "galleryImages": [
    "/tours/fall-4/ss.topping.webp",
    "/tours/fall-4/ss.pan.webp",
    "/tours/fall-4/ss.team.webp",
    "/tours/fall-4/ss.taiga.webp",
    "/tours/fall-4/ss.clip1.poster.webp",
    "/tours/fall-4/ss.clip2.poster.webp",
    "/tours/fall-4/ss.pan.webp",
    "/tours/fall-4/ss.clip3.poster.webp",
    "/tours/fall-4/ss.clip4.poster.webp",
    "/tours/fall-4/ss.clip5.poster.webp",
    "/tours/fall-4/ss.topping.webp",
    "/tours/fall-4/ss.clip6.poster.webp",
    "/tours/fall-4/ss.clip8.poster.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-4/ss.topping.webp",
    "/tours/fall-4/ss.pan.webp",
    "/tours/fall-4/ss.team.webp",
    "/tours/fall-4/ss.taiga.webp",
    "/tours/fall-4/ss.clip1.grid.webm",
    "/tours/fall-4/ss.clip2.grid.webm",
    "/tours/fall-4/ss.pan.webp",
    "/tours/fall-4/ss.clip3.grid.webm",
    "/tours/fall-4/ss.clip4.grid.webm",
    "/tours/fall-4/ss.clip5.grid.webm",
    "/tours/fall-4/ss.topping.webp",
    "/tours/fall-4/ss.clip6.grid.webm",
    "/tours/fall-4/ss.clip8.grid.webm"
  ],
  "prefaceBackgroundImageUrl": "/tours/fall-4/ss.topping.webp",
  "gridVideoPosters": {
    "/tours/fall-4/ss.clip1.grid.webm": "/tours/fall-4/ss.clip1.poster.webp",
    "/tours/fall-4/ss.clip2.grid.webm": "/tours/fall-4/ss.clip2.poster.webp",
    "/tours/fall-4/ss.clip3.grid.webm": "/tours/fall-4/ss.clip3.poster.webp",
    "/tours/fall-4/ss.clip4.grid.webm": "/tours/fall-4/ss.clip4.poster.webp",
    "/tours/fall-4/ss.clip5.grid.webm": "/tours/fall-4/ss.clip5.poster.webp",
    "/tours/fall-4/ss.clip6.grid.webm": "/tours/fall-4/ss.clip6.poster.webp",
    "/tours/fall-4/ss.clip8.grid.webm": "/tours/fall-4/ss.clip8.poster.webp"
  }
},
  'fall-5': {
  "imageUrl": "/tours/fall-5/cover.webp",
  "galleryImages": [
    "/tours/fall-5/peak2.webp",
    "/tours/fall-5/view.webp",
    "/tours/fall-5/ctz.clip4.poster.webp",
    "/tours/fall-5/woods.webp",
    "/tours/fall-5/yar.webp",
    "/tours/fall-5/ctz.clip1.poster.webp",
    "/tours/fall-5/ctz.clip2.poster.webp",
    "/tours/fall-5/ctz.clip3.poster.webp",
    "/tours/fall-5/forest.webp",
    "/tours/fall-5/top.webp",
    "/tours/fall-5/peak5.webp",
    "/tours/fall-5/hike.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-5/peak2.webp",
    "/tours/fall-5/view.webp",
    "/tours/fall-5/ctz.clip4.grid.webm",
    "/tours/fall-5/woods.webp",
    "/tours/fall-5/yar.webp",
    "/tours/fall-5/ctz.clip1.grid.webm",
    "/tours/fall-5/ctz.clip2.grid.webm",
    "/tours/fall-5/ctz.clip3.grid.webm",
    "/tours/fall-5/forest.webp",
    "/tours/fall-5/top.webp",
    "/tours/fall-5/peak5.webp",
    "/tours/fall-5/hike.webp"
  ],
  "gridVideoPosters": {
    "/tours/fall-5/ctz.clip1.grid.webm": "/tours/fall-5/ctz.clip1.poster.webp",
    "/tours/fall-5/ctz.clip2.grid.webm": "/tours/fall-5/ctz.clip2.poster.webp",
    "/tours/fall-5/ctz.clip3.grid.webm": "/tours/fall-5/ctz.clip3.poster.webp",
    "/tours/fall-5/ctz.clip4.grid.webm": "/tours/fall-5/ctz.clip4.poster.webp"
  }
},
  'fall-6': {
  "imageUrl": "/tours/fall-6/cover.webp",
  "galleryImages": [
    "/tours/fall-6/deerlol.webp",
    "/tours/fall-6/view.webp",
    "/tours/fall-6/hills.webp",
    "/tours/fall-6/deer.webp",
    "/tours/fall-6/mnd.clip1.poster.webp",
    "/tours/fall-6/mnd.clip2.poster.webp",
    "/tours/fall-6/drag.webp",
    "/tours/fall-6/mnd.clip3.poster.webp",
    "/tours/fall-6/mnd.clip4.poster.webp",
    "/tours/fall-6/hills5.webp",
    "/tours/fall-6/deer2.webp",
    "/tours/fall-6/mnd.clip5.poster.webp",
    "/tours/fall-6/deer3.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-6/deerlol.webp",
    "/tours/fall-6/view.webp",
    "/tours/fall-6/hills.webp",
    "/tours/fall-6/deer.webp",
    "/tours/fall-6/mnd.clip1.grid.webm",
    "/tours/fall-6/mnd.clip2.grid.webm",
    "/tours/fall-6/drag.webp",
    "/tours/fall-6/mnd.clip3.grid.webm",
    "/tours/fall-6/mnd.clip4.grid.webm",
    "/tours/fall-6/hills5.webp",
    "/tours/fall-6/deer2.webp",
    "/tours/fall-6/mnd.clip5.grid.webm",
    "/tours/fall-6/deer3.webp"
  ],
  "prefaceBackgroundImageUrl": "/tours/fall-6/hills3.webp",
  "gridVideoPosters": {
    "/tours/fall-6/mnd.clip1.grid.webm": "/tours/fall-6/mnd.clip1.poster.webp",
    "/tours/fall-6/mnd.clip2.grid.webm": "/tours/fall-6/mnd.clip2.poster.webp",
    "/tours/fall-6/mnd.clip3.grid.webm": "/tours/fall-6/mnd.clip3.poster.webp",
    "/tours/fall-6/mnd.clip4.grid.webm": "/tours/fall-6/mnd.clip4.poster.webp",
    "/tours/fall-6/mnd.clip5.grid.webm": "/tours/fall-6/mnd.clip5.poster.webp"
  },
  "gridVideoPostersMobile": {
    "/tours/fall-6/mnd.clip1.grid.webm": "/tours/fall-6/mnd.clip1.poster.mobile.webp",
    "/tours/fall-6/mnd.clip2.grid.webm": "/tours/fall-6/mnd.clip2.poster.mobile.webp",
    "/tours/fall-6/mnd.clip3.grid.webm": "/tours/fall-6/mnd.clip3.poster.mobile.webp",
    "/tours/fall-6/mnd.clip4.grid.webm": "/tours/fall-6/mnd.clip4.poster.mobile.webp",
    "/tours/fall-6/mnd.clip5.grid.webm": "/tours/fall-6/mnd.clip5.poster.webp"
  }
},
  'fall-7': {
  "imageUrl": "/tours/fall-7/cover.webp",
  "galleryImages": [
    "/tours/fall-7/view.webp",
    "/tours/fall-7/view3.webp",
    "/tours/fall-7/ddn.clip1.poster.webp",
    "/tours/fall-7/view2.webp",
    "/tours/fall-7/ddn.clip2.poster.webp",
    "/tours/fall-7/yarchill.webp",
    "/tours/fall-7/exit2.webp",
    "/tours/fall-7/camp.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-7/view.webp",
    "/tours/fall-7/view3.webp",
    "/tours/fall-7/ddn.clip1.grid.webm",
    "/tours/fall-7/view2.webp",
    "/tours/fall-7/ddn.clip2.grid.webm",
    "/tours/fall-7/yarchill.webp",
    "/tours/fall-7/exit2.webp",
    "/tours/fall-7/camp.webp"
  ],
  "prefaceBackgroundImageUrl": "/tours/fall-7/view3.webp",
  "gridVideoPosters": {
    "/tours/fall-7/ddn.clip1.grid.webm": "/tours/fall-7/ddn.clip1.poster.webp",
    "/tours/fall-7/ddn.clip2.grid.webm": "/tours/fall-7/ddn.clip2.poster.webp"
  }
},
  'fall-8': {
  "imageUrl": "/tours/fall-8/cover.webp",
  "galleryImages": [
    "/tours/fall-8/view3.webp",
    "/tours/fall-8/view.webp",
    "/tours/fall-8/top.webp",
    "/tours/fall-8/view2.webp",
    "/tours/fall-8/flz.clip1.poster.webp",
    "/tours/fall-8/top2.webp",
    "/tours/fall-8/love_actually.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-8/view3.webp",
    "/tours/fall-8/view.webp",
    "/tours/fall-8/top.webp",
    "/tours/fall-8/view2.webp",
    "/tours/fall-8/flz.clip1.grid.webm",
    "/tours/fall-8/top2.webp",
    "/tours/fall-8/love_actually.webp"
  ],
  "prefaceBackgroundImageUrl": "/tours/fall-8/view.webp",
  "gridVideoPosters": {
    "/tours/fall-8/flz.clip1.grid.webm": "/tours/fall-8/flz.clip1.poster.webp"
  }
},
  'fall-9': {
  "imageUrl": "/tours/fall-9/cover.webp",
  "galleryImages": [
    "/tours/fall-9/top3.webp",
    "/tours/fall-9/wine.webp",
    "/tours/fall-9/top.webp",
    "/tours/fall-9/view2.webp",
    "/tours/fall-9/vrb.clip1.poster.webp",
    "/tours/fall-9/rocks.webp",
    "/tours/fall-9/vrb.clip2.poster.webp",
    "/tours/fall-9/forest.webp",
    "/tours/fall-9/vrb.clip3.poster.webp",
    "/tours/fall-9/sign.webp",
    "/tours/fall-9/top2.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-9/top3.webp",
    "/tours/fall-9/wine.webp",
    "/tours/fall-9/top.webp",
    "/tours/fall-9/view2.webp",
    "/tours/fall-9/vrb.clip1.grid.webm",
    "/tours/fall-9/rocks.webp",
    "/tours/fall-9/vrb.clip2.grid.webm",
    "/tours/fall-9/forest.webp",
    "/tours/fall-9/vrb.clip3.grid.webm",
    "/tours/fall-9/sign.webp",
    "/tours/fall-9/top2.webp"
  ],
  "prefaceBackgroundImageUrl": "/tours/fall-9/wine.webp",
  "gridVideoPosters": {
    "/tours/fall-9/vrb.clip1.grid.webm": "/tours/fall-9/vrb.clip1.poster.webp",
    "/tours/fall-9/vrb.clip2.grid.webm": "/tours/fall-9/vrb.clip2.poster.webp",
    "/tours/fall-9/vrb.clip3.grid.webm": "/tours/fall-9/vrb.clip3.poster.webp"
  },
  "gridVideoPostersMobile": {
    "/tours/fall-9/vrb.clip1.grid.webm": "/tours/fall-9/vrb.clip1.poster.mobile.webp",
    "/tours/fall-9/vrb.clip2.grid.webm": "/tours/fall-9/vrb.clip2.poster.mobile.webp",
    "/tours/fall-9/vrb.clip3.grid.webm": "/tours/fall-9/vrb.clip3.poster.mobile.webp"
  }
},
  'fall-10': {
  "imageUrl": "/tours/fall-10/cover.webp",
  "galleryImages": [
    "/tours/fall-10/view.webp",
    "/tours/fall-10/beach.webp",
    "/tours/fall-10/ask.intro.poster.webp",
    "/tours/fall-10/ask.clip2.poster.webp",
    "/tours/fall-10/ask.clip4.poster.webp",
    "/tours/fall-10/ask.clip5.poster.webp",
    "/tours/fall-10/ask.clip6.poster.webp",
    "/tours/fall-10/beacon.webp",
    "/tours/fall-10/rock.webp",
    "/tours/fall-10/view2.webp",
    "/tours/fall-10/view3.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-10/view.webp",
    "/tours/fall-10/beach.webp",
    "/tours/fall-10/ask.intro.grid.webm",
    "/tours/fall-10/ask.clip2.grid.webm",
    "/tours/fall-10/ask.clip4.grid.webm",
    "/tours/fall-10/ask.clip5.grid.webm",
    "/tours/fall-10/ask.clip6.grid.webm",
    "/tours/fall-10/beacon.webp",
    "/tours/fall-10/rock.webp",
    "/tours/fall-10/view2.webp",
    "/tours/fall-10/view3.webp"
  ],
  "prefaceBackgroundImageUrl": "/tours/fall-10/beach.webp",
  "gridVideoPosters": {
    "/tours/fall-10/ask.intro.grid.webm": "/tours/fall-10/ask.intro.poster.webp",
    "/tours/fall-10/ask.clip2.grid.webm": "/tours/fall-10/ask.clip2.poster.webp",
    "/tours/fall-10/ask.clip4.grid.webm": "/tours/fall-10/ask.clip4.poster.webp",
    "/tours/fall-10/ask.clip5.grid.webm": "/tours/fall-10/ask.clip5.poster.webp",
    "/tours/fall-10/ask.clip6.grid.webm": "/tours/fall-10/ask.clip6.poster.webp"
  },
  "gridVideoPostersMobile": {
    "/tours/fall-10/ask.intro.grid.webm": "/tours/fall-10/ask.intro.poster.webp",
    "/tours/fall-10/ask.clip2.grid.webm": "/tours/fall-10/ask.clip2.poster.mobile.webp",
    "/tours/fall-10/ask.clip4.grid.webm": "/tours/fall-10/ask.clip4.poster.mobile.webp",
    "/tours/fall-10/ask.clip5.grid.webm": "/tours/fall-10/ask.clip5.poster.mobile.webp",
    "/tours/fall-10/ask.clip6.grid.webm": "/tours/fall-10/ask.clip6.poster.mobile.webp"
  }
},
  'fall-11': {
  "imageUrl": "/tours/fall-11/cover.webp",
  "galleryImages": [
    "/tours/fall-11/hero.webp",
    "/tours/fall-11/view.webp",
    "/tours/fall-11/shk.clip1.poster.webp",
    "/tours/fall-11/view2.webp",
    "/tours/fall-11/view3.webp",
    "/tours/fall-11/shk.clip2.poster.webp",
    "/tours/fall-11/climb.webp",
    "/tours/fall-11/view4.webp",
    "/tours/fall-11/shk.clip3.poster.webp",
    "/tours/fall-11/view5.webp",
    "/tours/fall-11/view6.webp",
    "/tours/fall-11/wow.webp",
    "/tours/fall-11/scallops.webp",
    "/tours/fall-11/earchin.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-11/hero.webp",
    "/tours/fall-11/view.webp",
    "/tours/fall-11/shk.clip1.grid.webm",
    "/tours/fall-11/view2.webp",
    "/tours/fall-11/view3.webp",
    "/tours/fall-11/shk.clip2.grid.webm",
    "/tours/fall-11/climb.webp",
    "/tours/fall-11/view4.webp",
    "/tours/fall-11/shk.clip3.grid.webm",
    "/tours/fall-11/view5.webp",
    "/tours/fall-11/view6.webp",
    "/tours/fall-11/wow.webp",
    "/tours/fall-11/scallops.webp",
    "/tours/fall-11/earchin.webp"
  ],
  "prefaceBackgroundImageUrl": "/tours/fall-11/view.webp",
  "gridVideoPosters": {
    "/tours/fall-11/shk.clip1.grid.webm": "/tours/fall-11/shk.clip1.poster.webp",
    "/tours/fall-11/shk.clip2.grid.webm": "/tours/fall-11/shk.clip2.poster.webp",
    "/tours/fall-11/shk.clip3.grid.webm": "/tours/fall-11/shk.clip3.poster.webp"
  }
},
  'fall-12': {
  "imageUrl": "/tours/fall-12/cover.webp",
  "galleryImages": [
    "/tours/fall-12/cover.webp",
    "https://placehold.co/1200x800/1A3C2E/ffffff?text=Тобизина+·+край+моря",
    "https://placehold.co/900x900/7BA7BC/ffffff?text=Тропа+к+мысу",
    "https://placehold.co/900x900/1A3C2E/ffffff?text=Каменное+плато",
    "https://placehold.co/900x900/C8A96E/1A3C2E?text=Скалы",
    "https://placehold.co/1200x800/7BA7BC/ffffff?text=Бухта+Карпинского",
    "https://placehold.co/900x900/E8A838/1A3C2E?text=Обед+на+берегу"
  ],
  "galleryGridUrls": [
    "/tours/fall-12/cover.webp",
    "https://placehold.co/1200x800/1A3C2E/ffffff?text=Тобизина+·+край+моря",
    "https://placehold.co/900x900/7BA7BC/ffffff?text=Тропа+к+мысу",
    "https://placehold.co/900x900/1A3C2E/ffffff?text=Каменное+плато",
    "https://placehold.co/900x900/C8A96E/1A3C2E?text=Скалы",
    "https://placehold.co/1200x800/7BA7BC/ffffff?text=Бухта+Карпинского",
    "https://placehold.co/900x900/E8A838/1A3C2E?text=Обед+на+берегу"
  ],
  "prefaceBackgroundImageUrl": "https://placehold.co/1200x800/1A3C2E/ffffff?text=Тобизина+·+край+моря"
},
  'fall-13': {
  "imageUrl": "/tours/fall-13/cover.webp",
  "galleryImages": [
    "/tours/fall-13/cover.webp",
    "/tours/fall-13/preface.webp",
    "/tours/fall-13/gam.clip6.poster.webp",
    "/tours/fall-13/gam.clip1.poster.webp",
    "/tours/fall-13/gam.clip3.poster.webp",
    "/tours/fall-13/view7.webp",
    "/tours/fall-13/rocks.webp",
    "/tours/fall-13/gam.clip5.poster.webp",
    "/tours/fall-13/sosna2.webp",
    "/tours/fall-13/dve-sosna.webp",
    "/tours/fall-13/summit-view.webp",
    "/tours/fall-13/astafiev-bay.webp"
  ],
  "galleryGridUrls": [
    "/tours/fall-13/cover.webp",
    "/tours/fall-13/preface.webp",
    "/tours/fall-13/gam.clip6.grid.webm",
    "/tours/fall-13/gam.clip1.grid.webm",
    "/tours/fall-13/gam.clip3.grid.webm",
    "/tours/fall-13/view7.webp",
    "/tours/fall-13/rocks.webp",
    "/tours/fall-13/gam.clip5.grid.webm",
    "/tours/fall-13/sosna2.webp",
    "/tours/fall-13/dve-sosna.webp",
    "/tours/fall-13/summit-view.webp",
    "/tours/fall-13/astafiev-bay.webp"
  ],
  "prefaceBackgroundImageUrl": "/tours/fall-13/preface.webp",
  "gridVideoPosters": {
    "/tours/fall-13/gam.clip1.grid.webm": "/tours/fall-13/gam.clip1.poster.webp",
    "/tours/fall-13/gam.clip3.grid.webm": "/tours/fall-13/gam.clip3.poster.webp",
    "/tours/fall-13/gam.clip5.grid.webm": "/tours/fall-13/gam.clip5.poster.webp",
    "/tours/fall-13/gam.clip6.grid.webm": "/tours/fall-13/gam.clip6.poster.webp"
  }
}
} as const satisfies Record<FallTourId, TourMediaBundle>;
