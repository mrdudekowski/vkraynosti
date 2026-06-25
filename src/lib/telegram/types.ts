/** Данные пользователя из `Telegram.WebApp.initDataUnsafe.user`. */
export interface TelegramUser {
  telegramId: number;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  languageCode?: string;
}

export interface TelegramWebAppUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
}

export interface TelegramWebAppInitDataUnsafe {
  user?: TelegramWebAppUser;
}

export interface TelegramBackButton {
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initDataUnsafe: TelegramWebAppInitDataUnsafe;
  BackButton: TelegramBackButton;
  colorScheme?: 'light' | 'dark';
  themeParams?: Record<string, string>;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};
