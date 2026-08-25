export type MediaFocalPoint = {
  x: number;
  y: number;
};

export type TourCoverCrop = {
  card?: MediaFocalPoint;
  hero?: MediaFocalPoint;
  heroLg?: MediaFocalPoint;
};

const KEYWORD_AXIS: Record<string, number> = {
  left: 0,
  top: 0,
  center: 50,
  right: 100,
  bottom: 100,
};

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function parseAxis(token: string): number | null {
  const keyword = KEYWORD_AXIS[token];
  if (keyword != null) {
    return keyword;
  }
  const percent = /^(-?\d+(?:\.\d+)?)%$/.exec(token);
  if (percent == null) {
    return null;
  }
  return clampPercent(Number(percent[1]));
}

export function parseMediaFocalPoint(value: string | undefined): MediaFocalPoint | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.startsWith('object-')) {
    return null;
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length !== 2) {
    return null;
  }
  const x = parseAxis(parts[0] ?? '');
  const y = parseAxis(parts[1] ?? '');
  if (x == null || y == null) {
    return null;
  }
  return { x, y };
}

export function formatMediaFocalPoint(point: MediaFocalPoint): string {
  const x = clampPercent(point.x);
  const y = clampPercent(point.y);
  const formatAxis = (value: number) => (Number.isInteger(value) ? String(value) : String(value));
  return `${formatAxis(x)}% ${formatAxis(y)}%`;
}

export function resolveMediaObjectPosition(value: string | undefined): {
  className?: string;
  objectPosition?: string;
} {
  if (value == null) {
    return {};
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return {};
  }
  if (trimmed.startsWith('object-')) {
    return { className: trimmed };
  }
  return { objectPosition: trimmed };
}

export function mediaObjectPositionCssVars(objectPosition: string | undefined): {
  className?: string;
  style?: { ['--media-object-position']: string };
} {
  const resolved = resolveMediaObjectPosition(objectPosition);
  if (resolved.objectPosition != null) {
    return {
      className: 'media-object-position',
      style: { ['--media-object-position']: resolved.objectPosition },
    };
  }
  if (resolved.className != null) {
    return { className: resolved.className };
  }
  return {};
}

/** Карусель на главной: `hero` до `lg`, `heroLg` с `lg`. */
export const TOUR_HERO_OBJECT_POSITION_CLASS = 'tour-hero-object-position' as const;

/** Hero страницы тура: `hero` до `md`, `heroLg` с планшета и десктопа. */
export const TOUR_DETAIL_HERO_OBJECT_POSITION_CLASS = 'tour-detail-hero-object-position' as const;

export function formatCoverCropCssVars(crop: TourCoverCrop | undefined): {
  ['--tour-hero-object-position']?: string;
  ['--tour-hero-object-position-lg']?: string;
} {
  return {
    ...(crop?.hero != null
      ? { ['--tour-hero-object-position']: formatMediaFocalPoint(crop.hero) }
      : {}),
    ...(crop?.heroLg != null
      ? { ['--tour-hero-object-position-lg']: formatMediaFocalPoint(crop.heroLg) }
      : {}),
  };
}

export function hasHeroCoverCrop(crop: TourCoverCrop | undefined): boolean {
  return crop?.hero != null || crop?.heroLg != null;
}
