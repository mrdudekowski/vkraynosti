# SEO baseline после оптимизации в ветке

Дата: 2026-09-03. Production не обновлялся.

## Артефакты и проверки

- `npm run build` — пройден.
- `npm run data:ssg` — создаёт 54 rendered public routes.
- `npm run verify:og-shells` — пройден для 56 public и 49 legacy routes.
- `npm run verify:seo-dist` — пройден; проверяет sitemap, наличие route HTML, canonical, robots, title, description, H1 и JSON-LD.
- Тесты regression для OG fallback, JPEG dimensions, static test shell, CollectionPage и SEO dist добавлены в ветку.

## Изменения

OG-shell использует локальный JPEG `og-cover-prod.jpg` при недоступном `ffmpeg`, а metadata ссылается именно на фактически выбранный файл. Сезонные каталоги получают `CollectionPage` JSON-LD и сохраняют тот же визуальный UI. Валидатор дистрибутива предотвращает повторное расхождение sitemap и rendered HTML.

## Что ещё требуется после деплоя

Проверить production HTTP/HTTPS, response status, initial HTML в Googlebot/Yandexbot user-agent, CDN/S3 доступность OG JPEG, Search Console/Yandex Webmaster и переобход. До этих действий нельзя заявлять, что сниппет уже исправился в поисковой выдаче.
