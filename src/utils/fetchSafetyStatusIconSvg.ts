import { HOME_SAFETY_STATUS_ICONS } from '../constants/images';

const rawSvgByUrl = new Map<string, Promise<string>>();

export function fetchSafetyStatusIconSvg(url: string): Promise<string> {
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
