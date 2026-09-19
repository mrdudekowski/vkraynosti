import { ADMIN_UI } from './constants/ui';

export const SITE_CHANNEL_TYPES = ['phone', 'email', 'telegram', 'whatsapp', 'max', 'link'] as const;
export type SiteChannelType = (typeof SITE_CHANNEL_TYPES)[number];

const PRESET_VALUES: Record<SiteChannelType, string> = {
  phone: 'phone',
  email: 'envelope',
  telegram: 'telegram',
  whatsapp: 'whatsapp',
  max: 'max',
  link: 'link',
};

export function isSiteChannelType(value: string): value is SiteChannelType {
  return (SITE_CHANNEL_TYPES as readonly string[]).includes(value);
}

export function siteChannelTypeLabel(type: string): string {
  return isSiteChannelType(type) ? ADMIN_UI.siteChannelTypes[type] : type;
}

export function siteChannelPresetIcon(type: string): { kind: 'preset'; value: string; alt: string } {
  const resolved: SiteChannelType = isSiteChannelType(type) ? type : 'link';
  return {
    kind: 'preset',
    value: PRESET_VALUES[resolved],
    alt: ADMIN_UI.siteChannelTypes[resolved],
  };
}

export function siteChannelInputMode(type: string): 'tel' | 'email' | 'url' {
  if (type === 'phone') {
    return 'tel';
  }
  if (type === 'email') {
    return 'email';
  }
  return 'url';
}
