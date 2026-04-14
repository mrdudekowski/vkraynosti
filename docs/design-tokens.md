# Дизайн-токены и адаптивность (Vkraynosti)

Канонический источник стилей — [`tailwind.config.ts`](../tailwind.config.ts). Дополнительно: [`src/index.css`](../src/index.css) (`@layer` components/utilities), типографика фразы героя — [`src/constants/typography.ts`](../src/constants/typography.ts), стеки шрифтов — [`src/constants/fontFamilyStacks.ts`](../src/constants/fontFamilyStacks.ts).

## Принцип mobile-first

Базовые классы рассчитаны на узкий viewport; префиксы `sm:`, `md:`, `season-md:`, `nav-desktop:` и т.д. добавляют правила при **min-width** (кроме явных max-брейкпоинтов ниже).

## Кастомные `screens` (min-width)

| Имя | px | Назначение |
| --- | --- | --- |
| `xs` | 360 | Минимальная ширина для подписи сезона у логотипа и др. |
| `phone` | 375 | Референсное устройство |
| `phone-lg` | 390 | |
| `tablet` | 428 | |
| **`season-md`** | **500** | Полная строка сезона в навбаре (`SeasonSwitcher`), скрытие `SeasonNavDock` |
| **`nav-desktop`** | **950** | Горизонтальные ссылки «Туры…Контакты», CTA в строке, скрытие бургера |

Стандартные брейкпоинты Tailwind (`sm` 640, `md` 768, `lg` 1024, `xl` 1280) не переопределены; используются для сеток секций, тултипов и т.п.

## Порог «до 500px»: `season-below-md` и `season-md`

Одна граница (500px) задаётся в [`tailwind.config.ts`](../tailwind.config.ts) так:

| Механизм | Условие | Пример |
| --- | --- | --- |
| **`season-below-md`** | **max-width 499px** | `season-below-md:…` — только viewport ≤499px |
| **`season-md`** | **min-width 500px** | `season-md:…` — от 500px и выше |

Не использовать произвольный **`max-[499px]`** — порог **499** задан один раз как `screens.season-below-md` рядом с `season-md`.

**Каскад Tailwind:** не сочетать **`hidden`** с **`season-below-md:block`** / **`season-below-md:inline-flex`** — утилита `hidden` может перекрыть max-вариант. Для «только ниже 500px» используйте mobile-first:

- `block season-md:hidden` или `inline-flex season-md:hidden` — видимость только &lt;500px;
- `hidden season-md:block` — скрыто по умолчанию, с 500px — `block` (как у `SeasonSwitcher` в navbar).

## Разные роли: `md` (768) и `nav-desktop` (950)

Это **не** дублирование одного и того же переключения:

| Брейкпоинт | px | Типичное назначение |
| --- | --- | --- |
| `md` | 768 | Сетки страниц, тултипы `SeasonSwitcher`, высота секций |
| `nav-desktop` | 950 | Режим «десктопного» навбара: ссылки в центре, CTA, без бургера |

Между 500px и 949px навбар может показывать компактный сезон и бургер, при этом контент страницы уже использует `md:` там, где это задумано.

## Проверка визуально (минимум)

Рекомендуемые ширины viewport: **320**, **390**, **499 / 500**, **768**, **950**, **1280**.

## Страница тура (`TourDetailPage`)

| Элемент | Где задано |
| --- | --- |
| Градиенты акцента заголовков секций | `theme.extend.backgroundImage`: `tour-detail-heading-accent-winter`, …spring, …summer, …fall |
| Маппинг сезон → класс фона акцента | [`src/constants/seasonTheme.ts`](../src/constants/seasonTheme.ts): `SEASON_TOUR_HEADING_ACCENT_BG_CLASS` |
| Компонент заголовка | [`src/components/tours/TourDetailSectionHeading.tsx`](../src/components/tours/TourDetailSectionHeading.tsx) |
| CSS-строка заголовка и акцент | `.tour-detail-section-heading-row`, `.tour-detail-section-heading-accent` в [`src/index.css`](../src/index.css) |
| Intro под hero (панорама + мета-факты) | `aspect-tour-intro-backdrop` (21/9) в [`tailwind.config.ts`](../tailwind.config.ts); [`TourDetailIntroBackdrop.tsx`](../src/components/tours/TourDetailIntroBackdrop.tsx); `.tour-detail-intro-backdrop__scrim`, `.tour-detail-key-facts--overlay`, отложенный stagger `.tour-detail-key-facts--deferred-stagger` в [`src/index.css`](../src/index.css) |
| Блок параметров тура | [`TourDetailMetaFacts.tsx`](../src/components/tours/TourDetailMetaFacts.tsx): на странице тура — `variant=\"onOverlay\"` в intro; `variant=\"default\"` при размещении над текстом; `.tour-detail-key-facts`, keyframes `tour-meta-stagger-in`, `delay-tour-meta-0` … `2` |
| Данные intro и сетка галереи без дубля кадра | [`src/types/index.ts`](../src/types/index.ts): `introBackdropImageUrl?`; [`src/data/tourIntroBackdrop.ts`](../src/data/tourIntroBackdrop.ts): `getResolvedIntroBackdropUrl`, `getGalleryGridImagesForTour`; [`TourDetailGallery`](../src/components/tours/TourDetailGallery.tsx): `fullGalleryIndexPerTile` |
| Резерв тени (мета) | `theme.extend.boxShadow.tourMetaPrice` — в разметке не используется |
| Числа в блоке фактов (длительность / сумма) | `fontSize.tour-detail-meta-facts-numeric`, `...-facts-price`; `tabular-nums` в разметке |
| Усиленный цвет уровня в фактах | `colors.difficultyFacts.*` → `UI.difficulty.factsTextFgOnly` |
| Размер шрифта (legacy мета) | `fontSize.tour-detail-meta-price` — в `TourDetailMetaFacts` заменён на `tour-detail-meta-facts-price` |
| Нижний CTA | `.tour-detail-footer-cta-block`, `.btn-tour-detail-footer-cta` в [`src/index.css`](../src/index.css) |

Клик по hero для открытия галереи **отключён**; просмотр фото — через галерею и `TourPhotoViewer`.

## Связанные файлы

- Анимации и компонентные классы: [`src/index.css`](../src/index.css)
- Ограничение ширины выезжающей панели бургера: `w-[min(100vw,theme(maxWidth.sm))]` — использует стандартный токен `maxWidth.sm` из темы Tailwind (640px)
