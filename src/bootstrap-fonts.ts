import {
  GOOGLE_FONTS_PRECONNECT_API,
  GOOGLE_FONTS_PRECONNECT_STATIC,
  GOOGLE_FONTS_STYLESHEET_HREF,
} from './constants/fonts';

const VK_FONTS_ATTR = 'data-vk-fonts';

/**
 * Подключает Google Fonts из `constants/fonts.ts` до основного CSS (без второго @import в bundle).
 */
if (typeof document !== 'undefined' && !document.head.querySelector(`link[${VK_FONTS_ATTR}]`)) {
  const head = document.head;

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

  head.append(preApi, preStatic, sheet);
}
