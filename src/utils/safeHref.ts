const HTTP_PROTOCOLS = new Set(['https:']);
const PHONE_PROTOCOL = 'tel:';
const MAIL_PROTOCOL = 'mailto:';

const FALLBACK_HREF = '#' as const;

const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

export const toSafeExternalHttpHref = (value: string): string => {
  const url = parseUrl(value);
  if (url == null) return FALLBACK_HREF;
  if (!HTTP_PROTOCOLS.has(url.protocol)) return FALLBACK_HREF;
  return url.toString();
};

export const toSafePhoneHref = (value: string): string => {
  if (!value.startsWith(PHONE_PROTOCOL)) return FALLBACK_HREF;
  const payload = value.slice(PHONE_PROTOCOL.length).replace(/\s+/g, '');
  if (!/^\+?[0-9()-]+$/.test(payload)) return FALLBACK_HREF;
  return `${PHONE_PROTOCOL}${payload}`;
};

export const toSafeMailtoHref = (value: string): string => {
  if (!value.startsWith(MAIL_PROTOCOL)) return FALLBACK_HREF;
  const address = value.slice(MAIL_PROTOCOL.length).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return FALLBACK_HREF;
  return `${MAIL_PROTOCOL}${address}`;
};
