import {
  YANDEX_METRIKA_INIT_OPTIONS,
  YANDEX_METRIKA_SCRIPT_ATTR,
  YANDEX_METRIKA_SCRIPT_SRC,
} from '../../constants/cookieConsent';

type YmQueueFn = ((...args: unknown[]) => void) & {
  a?: unknown[][];
  l?: number;
};

type WindowWithYm = Window & { ym?: YmQueueFn };

const getCounterId = (): number | null => {
  const raw = import.meta.env.VITE_YANDEX_METRIKA_ID?.trim();
  if (!raw) return null;
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) ? id : null;
};

const ensureYmQueue = (windowRef: WindowWithYm): YmQueueFn => {
  if (windowRef.ym) return windowRef.ym;

  const ym = ((...args: unknown[]) => {
    (ym.a = ym.a ?? []).push(args);
  }) as YmQueueFn;
  ym.a = [];
  ym.l = Date.now();
  windowRef.ym = ym;
  return ym;
};

const hasMetrikaScript = (): boolean => {
  if (typeof document === 'undefined') return false;
  if (document.querySelector(`script[${YANDEX_METRIKA_SCRIPT_ATTR}]`)) return true;

  for (let i = 0; i < document.scripts.length; i += 1) {
    if (document.scripts[i]?.src === YANDEX_METRIKA_SCRIPT_SRC) return true;
  }
  return false;
};

/** Подключает Яндекс.Метрику один раз; без `VITE_YANDEX_METRIKA_ID` — no-op. */
export function loadYandexMetrika(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const counterId = getCounterId();
  if (counterId == null) return;

  const windowRef = window as WindowWithYm;
  const ym = ensureYmQueue(windowRef);

  ym(counterId, 'init', YANDEX_METRIKA_INIT_OPTIONS);

  if (hasMetrikaScript()) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = YANDEX_METRIKA_SCRIPT_SRC;
  script.setAttribute(YANDEX_METRIKA_SCRIPT_ATTR, '');

  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.append(script);
  }
}
