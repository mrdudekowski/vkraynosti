# Миграция tour data на S3

## Архитектура

```text
Google Sheets
  → Apps Script (меню «Обновить …»)
  → PUT в S3: tour-schedule/tours_list.json | schedule.json
  → Frontend fetch (runtime, без rebuild)
```

## A. S3 (Timeweb)

1. Включить **Versioning** на бакете.
2. Настроить **CORS** для домена сайта и `http://localhost:5173` (см. `TimeWebDoc/examples/s3-cors-rumicandance.json`).
3. Публичное чтение объектов `tour-schedule/*.json` (или через CDN).
4. Записать базовый URL → `VITE_PUBLIC_S3_BASE_URL` (часто совпадает с `VITE_PUBLIC_ASSET_BASE_URL`).

## B. Frontend / CI

| Переменная | Назначение |
|------------|------------|
| `VITE_PUBLIC_S3_BASE_URL` | Откуда браузер читает JSON (`https://…/`) |

На `web-vkr` в GitHub Variables или TimeWeb App env. После смены — redeploy.

## C. Google Apps Script

1. Файлы: `Code.gs`, `Publish.gs`, `S3Upload.gs`.
2. Часовой пояс: `Asia/Vladivostok`.
3. **Свойства скрипта:**

| Свойство | Значение |
|----------|----------|
| `S3_BUCKET` | имя бакета |
| `S3_ACCESS_KEY` | ключ API (PutObject на `tour-schedule/*`) |
| `S3_SECRET_KEY` | секрет |
| `S3_ENDPOINT` | опц. `https://s3.twcstorage.ru` |
| `S3_REGION` | опц. `ru-1` |

4. Меню **Вкрайности → Обновить всё** (первая публикация).

Старый GAS Web App (`doGet`, CacheService) **не используется**.

## D. Проверка

1. JSON по публичному URL: `…/tour-schedule/tours_list.json`, `…/schedule.json`.
2. Поле `generatedAt` обновилось после публикации.
3. Сайт: карточки туров и календарь.

## E. Откат

S3 → объект → **Восстановить предыдущую версию** (versioning).

## F. Troubleshooting

| Симптом | Проверка |
|---------|----------|
| Ошибка в alert GAS | Лист «_Проверка», ключи S3 в свойствах скрипта |
| Сайт пустой | `VITE_PUBLIC_S3_BASE_URL`, CORS, redeploy |
| Старые данные | `generatedAt` в JSON, кэш CDN |

Памятка менеджерам: [TOUR_DATA_MANAGER_GUIDE.md](./TOUR_DATA_MANAGER_GUIDE.md)
