import { HOME_SAFETY_STATUS_ICONS } from '../constants/images';

const rawSvgByUrl = new Map<string, Promise<string>>();

const allowedSafetyStatusIconUrls = new Set<string>(HOME_SAFETY_STATUS_ICONS);

export function fetchSafetyStatusIconSvg(url: string): Promise<string> {
  if (!allowedSafetyStatusIconUrls.has(url)) {
    return Promise.reject(new Error(`Disallowed safety status icon URL: ${url}`));
  }

  const cached = rawSvgByUrl.get(url);
  if (cached) {
    return cached;
  }

  const request = fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(`Failed to load safety status icon: ${url}`);
    }
    return response.text();
  });

  rawSvgByUrl.set(url, request);
  return request;
}

/** Предзагрузка всех иконок статуса (главная #safety). */
export function prefetchSafetyStatusIcons(): void {
  for (const url of HOME_SAFETY_STATUS_ICONS) {
    void fetchSafetyStatusIconSvg(url);
  }
}
