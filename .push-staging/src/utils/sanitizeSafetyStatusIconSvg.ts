const SVG_NS = 'http://www.w3.org/2000/svg';

const ALLOWED_TAGS = new Set([
  'svg',
  'g',
  'path',
  'circle',
  'rect',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'defs',
  'lineargradient',
  'stop',
  'clippath',
  'mask',
]);

const ALLOWED_ATTRS = new Set([
  'class',
  'style',
  'fill',
  'viewbox',
  'xmlns',
  'width',
  'height',
  'version',
  'preserveaspectratio',
  'id',
  'x1',
  'y1',
  'x2',
  'y2',
  'offset',
  'stop-color',
  'stop-opacity',
  'd',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'points',
  'transform',
  'fill-rule',
  'clip-rule',
  'stroke',
  'stroke-width',
  'stroke-linejoin',
  'stroke-miterlimit',
]);

const SAFE_STYLE_RE = /^[\s#%(),.\d:a-z-]+$/i;
const SAFE_ID_RE = /^[a-zA-Z][\w-]*$/;

function isAllowedAttribute(name: string, value: string): boolean {
  const normalized = name.toLowerCase();
  if (normalized.startsWith('on')) return false;
  if (normalized === 'href' || normalized.includes('href')) return false;
  if (!ALLOWED_ATTRS.has(normalized)) return false;
  if (normalized === 'style' && !SAFE_STYLE_RE.test(value)) return false;
  if (normalized === 'id' && !SAFE_ID_RE.test(value)) return false;
  return true;
}

function cloneSanitizedElement(source: Element): Element | null {
  const tag = source.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tag)) return null;

  const clone = document.createElementNS(SVG_NS, source.tagName);
  for (const attr of source.attributes) {
    if (!isAllowedAttribute(attr.name, attr.value)) continue;
    clone.setAttribute(attr.name, attr.value);
  }

  for (const child of source.children) {
    const sanitizedChild = cloneSanitizedElement(child);
    if (sanitizedChild) {
      clone.appendChild(sanitizedChild);
    }
  }

  return clone;
}

/**
 * Парсит SVG разметки статуса безопасности и возвращает узел для mount в DOM
 * (без `dangerouslySetInnerHTML`).
 */
export function parseSanitizedSafetyStatusIconSvg(markup: string): SVGSVGElement | null {
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
  if (doc.querySelector('parsererror')) return null;

  const root = doc.documentElement;
  if (root.tagName.toLowerCase() !== 'svg') return null;

  const sanitized = cloneSanitizedElement(root);
  return sanitized instanceof SVGSVGElement ? sanitized : null;
}
