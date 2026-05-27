import { SEASON_ACCENT_HEX } from '../constants/seasonAccentHex';
import type { Season } from '../types';

const DARK_FILL_PATTERN = /style="fill:rgb\(3,4,4\);?"/gi;
const LIGHT_FILL_PATTERN = /style="fill:white;?"/gi;

const SAFETY_ICON_DARK_FILL = '#030404' as const;

type TransformSafetyStatusIconSvgOptions = {
  gradientId: string;
  season: Season;
  /** При reduce — сплошной акцент вместо градиента на светлых деталях. */
  solidHighlight: boolean;
};

function buildHighlightGradientDefs(gradientId: string, season: Season): string {
  const accent = SEASON_ACCENT_HEX[season];
  return `<defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
<stop offset="100%" stop-color="${accent}"/>
</linearGradient></defs>`;
}

/**
 * Подготавливает SVG статуса: тёмные контуры фиксированные, светлые детали — сезонный акцент.
 */
const SAFE_GRADIENT_ID_RE = /^[a-zA-Z][\w-]*$/;

export function transformSafetyStatusIconSvg(
  svgMarkup: string,
  { gradientId, season, solidHighlight }: TransformSafetyStatusIconSvgOptions
): string {
  if (!SAFE_GRADIENT_ID_RE.test(gradientId)) {
    throw new Error('Invalid safety status icon gradient id');
  }

  const highlightFill = solidHighlight
    ? SEASON_ACCENT_HEX[season]
    : `url(#${gradientId})`;

  const withFills = svgMarkup
    .replace(DARK_FILL_PATTERN, `style="fill:${SAFETY_ICON_DARK_FILL}"`)
    .replace(LIGHT_FILL_PATTERN, `style="fill:${highlightFill}"`);

  const defs = solidHighlight ? '' : buildHighlightGradientDefs(gradientId, season);

  return withFills.replace(/<svg([^>]*)>/, `<svg$1 class="size-full">${defs}`);
}
