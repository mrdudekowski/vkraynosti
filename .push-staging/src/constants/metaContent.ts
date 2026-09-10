/** Max length for meta / og / twitter description (social preview safe limit). */
export const META_DESCRIPTION_MAX_LENGTH = 120 as const;

/** Collapse whitespace in meta tag text values for OG / Twitter shells. */
export const normalizeMetaContent = (value: string): string =>
  value
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** True when value is safe for meta content attributes (no raw newlines / tabs). */
export const isNormalizedMetaContent = (value: string): boolean =>
  value === normalizeMetaContent(value) && !/[\r\n\t]/.test(value);

/**
 * Truncate meta description at a word boundary, append ellipsis when shortened.
 * Result length is at most `maxLength` (default 120).
 */
export const truncateMetaDescription = (
  value: string,
  maxLength: number = META_DESCRIPTION_MAX_LENGTH,
): string => {
  const normalized = normalizeMetaContent(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const ellipsis = '…';
  const sliceLimit = maxLength - ellipsis.length;
  if (sliceLimit <= 0) {
    return ellipsis.slice(0, maxLength);
  }

  let cut = normalized.slice(0, sliceLimit);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > sliceLimit * 0.5) {
    cut = cut.slice(0, lastSpace);
  }

  return `${cut.trimEnd()}${ellipsis}`;
};

/** Normalize and enforce site-wide meta description length limit. */
export const finalizeMetaDescription = (value: string): string =>
  truncateMetaDescription(normalizeMetaContent(value), META_DESCRIPTION_MAX_LENGTH);
