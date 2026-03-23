import {
  GOOGLE_FONTS_PRECONNECT_API,
  GOOGLE_FONTS_PRECONNECT_STATIC,
  GOOGLE_FONTS_STYLESHEET_HREF,
  NORD_FONT_URLS,
} from './constants/fonts';

const VK_FONTS_ATTR = 'data-vk-fonts';

/**
 * Nord `@font-face` вставляется из JS с полными URL (`BASE_URL`), без `url(var(...))` — иначе минификатор CSS ломает синтаксис.
 */
function injectNordFontFaces(): void {
  if (typeof document === 'undefined') return;
  if (document.head.querySelector('style[data-vk-nord-font-face]')) return;

  const style = document.createElement('style');
  style.setAttribute('data-vk-nord-font-face', '');
  style.textContent = `
@font-face {
  font-family: 'Nord';
  src: url('${NORD_FONT_URLS.regular}') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Nord';
  src: url('${NORD_FONT_URLS.medium}') format('truetype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Nord';
  src: url('${NORD_FONT_URLS.bold}') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
`.trim();
  document.head.prepend(style);
}

/**
 * Подключает Google Fonts из `constants/fonts.ts` до основного CSS (без второго @import в bundle).
 * Preload критичного Nord Regular — быстрее первый текст в `font-heading`.
 */
if (typeof document !== 'undefined') {
  injectNordFontFaces();

  if (!document.head.querySelector(`link[${VK_FONTS_ATTR}]`)) {
    const head = document.head;

    const preloadNord = document.createElement('link');
    preloadNord.rel = 'preload';
    preloadNord.as = 'font';
    preloadNord.type = 'font/ttf';
    preloadNord.href = NORD_FONT_URLS.regular;
    preloadNord.crossOrigin = 'anonymous';
    preloadNord.setAttribute(VK_FONTS_ATTR, '');

    const preApi = document.createElement('link');
    preApi.rel = 'preconnect';
    preApi.href = GOOGLE_FONTS_PRECONNECT_API;
    preApi.setAttribute(VK_FONTS_ATTR, '');

    const preStatic = document.createElement('link');
    preStatic.rel = 'preconnect';
    preStatic.href = GOOGLE_FONTS_PRECONNECT_STATIC;
    preStatic.crossOrigin = '';
    preStatic.setAttribute(VK_FONTS_ATTR, '');

    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = GOOGLE_FONTS_STYLESHEET_HREF;
    sheet.setAttribute(VK_FONTS_ATTR, '');

    head.append(preloadNord, preApi, preStatic, sheet);
  }
}
