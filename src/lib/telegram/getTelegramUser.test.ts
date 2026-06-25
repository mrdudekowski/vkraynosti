import { describe, expect, it } from 'vitest';
import { getTelegramUser } from './getTelegramUser';

describe('getTelegramUser', () => {
  it('returns null when Telegram WebApp is unavailable', () => {
    expect(getTelegramUser()).toBeNull();
  });

  it('maps initDataUnsafe.user fields', () => {
    window.Telegram = {
      WebApp: {
        ready: () => {},
        expand: () => {},
        close: () => {},
        BackButton: {
          show: () => {},
          hide: () => {},
          onClick: () => {},
          offClick: () => {},
        },
        initDataUnsafe: {
          user: {
            id: 42,
            username: 'traveler',
            first_name: 'Anna',
            last_name: 'Ivanova',
            language_code: 'ru',
          },
        },
      },
    };

    expect(getTelegramUser()).toEqual({
      telegramId: 42,
      telegramUsername: 'traveler',
      telegramFirstName: 'Anna',
      telegramLastName: 'Ivanova',
      languageCode: 'ru',
    });

    delete window.Telegram;
  });
});
