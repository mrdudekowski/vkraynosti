/** Collapse whitespace in meta tag text values for OG / Twitter shells. */
export const normalizeMetaContent = (value: string): string =>
  value
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** True when value is safe for meta content attributes (no raw newlines / tabs). */
export const isNormalizedMetaContent = (value: string): boolean =>
  value === normalizeMetaContent(value) && !/[\r\n\t]/.test(value);
