import { getTelegramUser } from './getTelegramUser';

export { getTelegramUser };
export type { TelegramUser } from './types';

export const isTelegramWebApp = (): boolean =>
  typeof window !== 'undefined' && window.Telegram?.WebApp != null;

/** Инициализация Mini App внутри Telegram; вне Telegram — no-op. */
export const initTelegramWebApp = (): void => {
  const webApp = window.Telegram?.WebApp;
  if (webApp == null) {
    return;
  }
  webApp.ready();
  webApp.expand();
};
