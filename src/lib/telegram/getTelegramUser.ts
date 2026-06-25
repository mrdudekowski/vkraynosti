import type { TelegramUser, TelegramWebAppUser } from './types';

const mapTelegramUser = (user: TelegramWebAppUser): TelegramUser => ({
  telegramId: user.id,
  telegramUsername: user.username,
  telegramFirstName: user.first_name,
  telegramLastName: user.last_name,
  languageCode: user.language_code,
});

/** Возвращает пользователя Telegram или `null` вне WebApp / без initData. */
export const getTelegramUser = (): TelegramUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (user == null) {
    return null;
  }
  return mapTelegramUser(user);
};
