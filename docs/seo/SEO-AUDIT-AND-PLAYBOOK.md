# SEO-аудит и playbook VKRAYNOSTI.RU

Дата аудита: 2026-09-03. Область изменений: ветка `codex/cms-crm-phase1`. Деплой не выполнялся.

## Резюме

Основная причина плохого сниппета — поисковик видел SPA-шаблон и/или ошибочный текст загрузки до того, как React успевал обновить `head` и тело страницы. Дополнительный риск давал OG-пайплайн: при отсутствии исполняемого `ffmpeg` он мог оставлять WebP и ссылаться на несуществующий JPEG.

В ветке исправлены и проверяются:

- data-SSG HTML для главной, сезонных каталогов и опубликованных/готовящихся туров;
- единый title, description, robots, canonical, Open Graph и Twitter metadata;
- JSON-LD для Organization/WebSite, CollectionPage сезонных каталогов, TouristTrip и BreadcrumbList;
- sitemap только для indexable URL; закрытые `/safety`, `/privacy`, Telegram-маршруты и hidden-туры исключены;
- OG-shell с JPEG 1200×630 и безопасным локальным fallback `og-cover-prod.jpg`;
- локальный gate `npm run verify:seo-dist`, проверяющий соответствие sitemap, HTML-файлов, canonical, robots, H1 и JSON-LD.

## Политика публикации

`active` — `index,follow`, входит в sitemap и получает rendered HTML. `in_development` — `noindex,follow`, доступен пользователю, но не входит в sitemap. `hidden` — отсутствует в каталоге и не должен публиковаться. Удалённые/неизвестные маршруты — not-found и `noindex,nofollow`. Юридические страницы `/safety` и `/privacy` закрыты от индексации.

Изменение статуса должно проходить один путь: локальный каталог → генерация и проверка артефактов → staging → production. Нельзя считать смену статуса опубликованной без проверки HTTP и rendered HTML после деплоя.

## Чек-лист перед публикацией

1. Обновить каталог и проверить, что статус каждого URL соответствует политике.
2. Выполнить `npm run build`.
3. Выполнить `npm run data:ssg` и `npm run og:shells`.
4. Выполнить `npm run verify:seo-dist` и `npm run verify:og-shells`.
5. Проверить несколько initial HTML: `/`, сезон, активный тур, `in_development`, not-found.
6. Проверить через HTTP staging: status, `Content-Type`, canonical, robots, H1 и отсутствие текста ошибки в indexable body.
7. После production-деплоя проверить Google URL Inspection и Yandex Webmaster; запросить переобход только после подтверждения корректного HTML.

## Мониторинг

Еженедельно сверять sitemap с каталогом, число indexable URL, страницы с `noindex`, HTTP 4xx/5xx, Core Web Vitals и Search Console/Yandex отчёты. Отдельно отслеживать, не возвращается ли в title/body текст `Что-то пошло не так` или `Произошла ошибка`.

## Roadmap на 90 дней

- Дни 1–7: выкатить сборочные гейты на staging, проверить HTTP для Googlebot/Yandexbot и отправить sitemap в панели вебмастеров.
- Дни 8–30: собрать baseline CTR/покрытия/ошибок, вручную улучшить описания приоритетных active-туров, проверить изображения и Core Web Vitals.
- Дни 31–60: закрыть контентные пробелы по четырём сезонным кластерам, добавить только подтверждённые FAQ/сущности, повторить crawl-проверку.
- Дни 61–90: сравнить запросы и конверсии до/после, удалить неэффективные дубли, формализовать еженедельный SEO-release gate.

## Источники требований

- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: site names](https://developers.google.com/search/docs/appearance/site-names)
- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering)
- [Google: structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Yandex: how robots see JavaScript](https://yandex.com/support/webmaster/en/robot-workings/vision)
- [Yandex: robots.txt](https://yandex.com/support/webmaster/en/controlling-robot/robots-txt)
- [Yandex: sitemap](https://yandex.com/support/webmaster/en/controlling-robot/sitemap)
