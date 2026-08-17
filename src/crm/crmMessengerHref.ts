import type { CrmMessenger } from './crmDocument';

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function crmCallHref(phone: string): string {
  const digits = digitsOnly(phone);
  return digits.length > 0 ? `tel:+${digits}` : `tel:${phone.trim()}`;
}

export function crmMessengerHref(
  messenger: CrmMessenger,
  phone: string,
  handle: string,
): string | null {
  const trimmedHandle = handle.trim().replace(/^@/, '');
  if (messenger === 'telegram') {
    if (trimmedHandle.length > 0) {
      return `https://t.me/${encodeURIComponent(trimmedHandle)}`;
    }
    return crmCallHref(phone);
  }
  if (messenger === 'whatsapp') {
    const digits = digitsOnly(trimmedHandle.length > 0 ? trimmedHandle : phone);
    return digits.length > 0 ? `https://wa.me/${digits}` : null;
  }
  if (messenger === 'phone') {
    return crmCallHref(phone);
  }
  return null;
}
