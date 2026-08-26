# Дизайн полной SEO-оптимизации VKRAYNOSTI.RU

Дата: 2026-09-03
Ветка: `cms-crm-phase1`
Граница: изменения и проверки только в этой ветке; push/deploy не выполняются.

## Цель

Сделать публичные страницы «Вкрайности» понятными для Google и Яндекса на всех этапах цепочки: crawler → initial HTML → rendering → indexing → SERP → полезная страница. Визуальный редизайн не входит в задачу.

## Подтверждённое исходное состояние

- Production homepage наблюдалась с loading/error-текстом вместо нормального содержимого.
- Репозиторий — React/Vite SPA с `react-router-dom`.
- В коде уже есть общий `PageMeta`, SEO-константы, publication-aware sitemap/robots, data-SSG и OG-shell генерация.
- Локальный `build` проходит, а `data:ssg` создаёт статический HTML для публичных маршрутов.
- `verify:og-shells` выявляет проблему локальной генерации JPEG из-за недоступного `ffmpeg-static`.
- Рабочее дерево изначально содержит большое количество пользовательских изменений; unrelated-файлы сохраняются.

## Объём работ

### 1. Baseline и inventory

Создать воспроизводимый audit для исходников и локального `dist`, включая таблицу маршрутов: status, indexability, title, description, H1, canonical, OG, JSON-LD и sitemap membership. Отдельно проверить homepage, сезонные списки, несколько туров, `/safety`, `/privacy`, 404, legacy URL, `/telegram` и query parameters.

### 2. Initial HTML и JS rendering

Сравнить SPA-shell, data-SSG HTML и runtime DOM. Loading/error/boot-splash не должны быть единственным или главным семантическим содержимым страницы. Основным no-JS контрактом считать статически сгенерированные body/head для SEO-маршрутов; Telegram оставить CSR-only и закрыть от индексации.

### 3. Единый SEO layer

Сохранить и довести до единого источника функции для:

- title и description homepage, сезонов и туров;
- canonical URL и legacy URL policy;
- robots по publication status;
- Open Graph/Twitter;
- Organization, WebSite, TouristTrip и BreadcrumbList JSON-LD;
- sitemap и robots generation.

SEO override из CMS не добавлять в текущий этап, но сохранить чистую точку расширения (`seoTitle`, `seoDescription`, `seoImage`) без дублирования логики.

### 4. Publication/indexing policy

Зафиксировать и проверить правила:

- `active`: index,follow; присутствует в sitemap;
- `in_development`: noindex,follow; доступен для редакционной проверки, отсутствует в sitemap;
- `hidden`: not-found/noindex; отсутствует в sitemap и OG/data-SSG route set;
- `/safety` и `/privacy`: noindex;
- `/telegram` и flow-страницы: noindex,nofollow;
- 404 и неизвестные legacy/query маршруты: закрыты от индексации и не объявляются canonical как другая indexable-страница.

### 5. OG и static generation

Усилить pipeline так, чтобы publication build не мог завершиться с непроверенными SEO-shells. Проверять наличие head/body, абсолютные canonical/OG URL, корректные размеры и MIME OG image. Ошибка конвертации изображения должна иметь детерминированный fallback и не маскировать проблему предупреждением.

### 6. Search/SERP research

Зафиксировать наблюдаемую выдачу Google и Яндекса для бренда, домена, туров и информационно-коммерческих кластеров. Отделить подтверждённые SERP-факты от гипотез. Search Console и Яндекс Вебмастер не считать проверенными без доступа к аккаунтам.

### 7. Semantic map и roadmap

Составить карту query cluster → intent → target page → priority, выявить cannibalization-риск и подготовить NOW/NEXT/LATER плюс 90-дневный план. Не создавать doorway pages, keyword stuffing, fake reviews или schema spam.

### 8. Документация

Создать `docs/seo/SEO-AUDIT-AND-PLAYBOOK.md` с BEFORE/AFTER, root causes, изменёнными файлами, архитектурой, индексируемыми статусами, Google/Yandex runbooks, publishing checklist, KPI и остаточными рисками.

## Варианты реализации

1. **Рекомендуемый: статические SEO-shells + существующий SPA.** Сохранить текущий UI и добавить строгие build/verification gates для data-SSG и OG-shells. Минимальный риск и совместимость с текущим Timeweb/GitHub Pages пайплайном.
2. **Полная миграция на SSR/Next.js.** Даёт серверный HTML в runtime, но меняет стек, deployment и CMS-интеграцию; не оправдана, пока статический pipeline покрывает публичные маршруты.
3. **Bot-specific dynamic rendering.** Не выбирать: усложняет эксплуатацию, создаёт риск различий для робота и пользователя и является workaround, а не основной архитектурой.

## Поток данных

```text
CMS/catalog publication status
        ↓
tour route + publication policy
        ↓
SEO metadata/schema generators
        ↓
data-SSG body + OG shells + sitemap/robots
        ↓
build verification and local crawl
        ↓
manual owner reindexing after deployment
```

## Проверки и критерии приёмки

- `npm run seo:check` проходит.
- `npm run build` проходит.
- data-SSG создаёт ожидаемые публичные маршруты с H1 и содержательным body.
- OG verification проходит без missing required tags и без silent image fallback.
- Для homepage, сезона и 3–5 туров verified: HTTP 200, title, description, H1, canonical, robots, OG и JSON-LD.
- `/safety`, `/privacy`, `/telegram`, 404, hidden/in-development и legacy URL соответствуют policy.
- До/после baseline сохранён в документации.
- Ни один unrelated пользовательский файл не изменён.

## Не входит

- визуальный редизайн;
- изменение CMS-моделей и production-данных;
- push, deploy, DNS, Search Console или Яндекс Вебмастер;
- обещания конкретных позиций или роста трафика;
- массовое создание новых SEO-страниц.
