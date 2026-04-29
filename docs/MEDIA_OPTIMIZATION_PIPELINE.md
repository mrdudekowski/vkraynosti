# Media Optimization Pipeline (Vkraynosti)

Полная инструкция для разработчиков и агентов: как добавлять и оптимизировать видео до эталонного состояния проекта.

## TL;DR for agents

1. Добавь/обнови видео в `public/tours/<tour-id>/` по текущей naming-схеме.
2. Запусти dry-run: `batch-shrink-public-webm.ps1 -DryRun -MinSizeMb 10`.
3. Запусти реальный shrink: `batch-shrink-public-webm.ps1 -MinSizeMb 10`.
4. Обнови только SSOT-файлы (`images.ts`, `toursData.ts`, при необходимости preload-константы).
5. Убедись, что нет hardcode URL в компонентах.
6. Проверка: `npm run build`.
7. Проверка: `npm run test:e2e:perf`.
8. Проверка Home guardrail: `npx playwright test e2e/home-performance.spec.ts`.
9. Сделай ffprobe-аудит (размер/разрешение/битрейт) и зафиксируй “до/после”.
10. Merge только если:
   - нет oversized (`height > 1920`),
   - нет перегретых битрейтов без обоснования,
   - нет ранних тяжёлых video-запросов на Home.

---

## 0) Цель и принцип

Цель: любое новое видео должно попадать в проект уже оптимизированным по размеру, разрешению и загрузке в рантайме, без деградации UX.

Принципы:
- Single Source of Truth: пути и соответствия только в канонических файлах.
- No Hardcode: не добавлять “временные” пути и preload-правила напрямую в компоненты.
- Минимальные, обратимые изменения: сначала измерение, потом правка.

---

## 1) Канонические точки (обязательно)

При работе с медиа использовать только эти источники:

- Медиа-константы: `src/constants/images.ts`
- Данные туров: `src/data/toursData.ts`
- Выбор grid/viewer URL: `src/utils/tourGalleryUrls.ts`
- Детект видео: `src/utils/isVideoAssetUrl.ts`
- Галерея/видео-рендер:
  - `src/components/tours/TourDetailGallery.tsx`
  - `src/components/tours/GalleryGridVideo.tsx`
  - `src/components/tours/TourPhotoViewer.tsx`
  - `src/components/shared/PlaceholderImage.tsx`
- Home/banner preload:
  - `src/pages/Home.tsx`
  - `src/components/home/HomeSeasonBanner.tsx`
  - `src/constants/homeSeasonBannerVideoPreload.ts`
  - `src/data/homeSeasonBannerClips.ts`
  - `src/components/shared/PageMeta.tsx`
- Скрипты кодирования:
  - `scripts/media/WebmTourEncoding.ps1`
  - `scripts/batch-shrink-public-webm.ps1`
  - `scripts/generate-home-season-banner-loop-videos.cjs`
  - `scripts/generate-home-season-banner-loop-videos.ps1`

---

## 2) Эталонные технические критерии (текущий стандарт)

### 2.1 Формат и кодек
- Основной формат: `.webm` (VP9, `yuv420p`).
- Постеры: `.webp`.
- Фото-ассеты туров (cover/preface/gallery grid+viewer): только `.webp`.
- Если входной формат не `.webp` (png/jpg/jpeg) — сначала конвертировать в `.webp`, затем оптимизировать по весу.

### 2.2 Разрешение
- Не допускать oversized по длинной стороне:
  - `full`: max длинная сторона 1920
  - `grid`: max длинная сторона 854
  - `banner`: max длинная сторона 800
- Проверка: в итоговом аудите не должно быть видео с `height > 1920`.

### 2.3 Размер/битрейт
- Целевой “здоровый” диапазон для одного ролика: как правило до ~10 MB.
- Допустимы единичные пограничные файлы около 10 MB+, только при оправданной длительности и после проверки качества.
- Не допускать перегретые файлы по битрейту (ориентир: >20 Mbps — флаг для пересмотра).

### 2.4 Runtime-загрузка
- Не грузить тяжёлые видео “на всякий случай” на первом экране.
- Для Home в раннем окне (первые секунды) video-байты должны быть нулевыми или близкими к нулю (см. e2e guardrail ниже).

---

## 3) Пайплайн (пошагово)

## Шаг A — Подготовка и размещение исходников

1. Положить исходники в `public/tours/<tour-id>/`.
2. Сформировать naming под текущую схему:
   - `*.webm` (viewer/full),
   - `*.grid.webm` (grid),
   - `*.poster.webp` (постеры для grid/video/banner где нужно).

Важно: не подключать файлы в UI до кодирования и аудита.

## Шаг B — Базовая перекодировка скриптами

Использовать только существующие скрипты:

- Массовая оптимизация:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\batch-shrink-public-webm.ps1 -DryRun -MinSizeMb 10`
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\batch-shrink-public-webm.ps1 -MinSizeMb 10`
- Баннер зимы на сайте: туровые `*.grid.webm` + `HOME_SEASON_BANNER_WINTER_CLIP_SOURCE_START_SEC` в `src/constants/images.ts`.
- `npm run generate:banner-loops` — опционально: нарезка превью в `public/banners_winter/*.banner-loop.webm` (не обязательна для продакшена).

Примечание:
- Сначала DryRun, затем реальный запуск.
- Порог `MinSizeMb` выбирать по этапу работ:
  - грубый проход: 30 → 20,
  - финальный “добивающий”: 10.

## Шаг C — Интеграция в SSOT

1. Обновить `src/constants/images.ts`:
   - viewer/grid массивы,
   - poster mapping для grid-видео.
2. Обновить `src/data/toursData.ts`:
   - `galleryImages` (viewer),
   - `galleryGridUrls` (grid),
   - `prefaceBackgroundImageUrl` если требуется.
3. Проверить соответствие индексов и layout-веток в `TourDetailGallery`.

Запрещено:
- дублировать пути в компонентах,
- тащить raw URL в JSX.

## Шаг D — Runtime policy (обязательные правила)

- `HomeSeasonBanner`:
  - не монтировать все video `src` одновременно,
  - head preload держать минимальным — см. комментарий в `homeSeasonBannerVideoPreload.ts` (сеть/приоритеты, не «все колонки из одного preload»),
  - eager/high только для реально критичных постеров.
- Grid-видео (`GalleryGridVideo`):
  - `preload="none"`,
  - подключение после viewport entry,
  - постер до появления во viewport.
- Декоративные offscreen видео:
  - gate по viewport (`IntersectionObserver`) + постер fallback.

## Шаг E — Проверка и приёмка

Обязательно выполнить:

1. Сборка:
   - `npm run build`
2. Perf e2e тура:
   - `npm run test:e2e:perf`
3. Guardrail главной:
   - `npx playwright test e2e/home-performance.spec.ts`
4. Видео-аудит (`ffprobe`) по всем файлам:
   - размер,
   - разрешение,
   - fps,
   - duration,
   - bitrate.

---

## 4) Команды для финального аудита

### 4.1 Сводка по всем видео

```powershell
$root='public'
$videos=Get-ChildItem -Path $root -Recurse -File -Include *.webm,*.mp4,*.mov,*.ogg
$sum=($videos|Measure-Object Length -Sum).Sum
'.webm	count={0}	total={1:N1} MB	avg={2:N2} MB' -f $videos.Count,($sum/1MB),(($sum/$videos.Count)/1MB)
```

### 4.2 Полный ffprobe-аудит

Использовать скрипт-аналог, который пишет `video-audit-final.json` с полями:
- `file`, `sizeMB`, `codec`, `width`, `height`, `fps`, `durationSec`, `bitrateMbps`.

Минимальные проверки:
- `height > 1920` = 0 файлов
- `bitrateMbps > 20` = 0 (или обоснованные исключения)
- `sizeMB > 10` — минимальный остаточный хвост, вручную подтверждённый

---

## 5) Чеклист “готово к merge”

- [ ] Все новые видео добавлены через SSOT-файлы, без дублирования путей.
- [ ] `npm run build` проходит.
- [ ] `npm run test:e2e:perf` проходит.
- [ ] `npx playwright test e2e/home-performance.spec.ts` проходит.
- [ ] Нет новых ранних тяжёлых video-запросов на Home.
- [ ] Нет oversized-видео (`height > 1920`).
- [ ] Нет аномально высоких битрейтов без обоснования.
- [ ] Добавлен краткий отчёт “до/после” (размеры + ключевые perf-факты).

---

## 6) Антипаттерны (что запрещено)

- Добавлять новые `fetch`/телеметрию в runtime-компоненты без явной продуктовой причины.
- Ставить `preload="metadata|auto"` на декоративное видео первого экрана без измерений.
- Массово выставлять `fetchPriority="high"` для некритичных медиа.
- Хранить дубли одного и того же пути в нескольких местах.

---

## 7) Быстрый “операционный” сценарий для нового тура

1. Добавил исходники в `public/tours/<id>`.
2. `batch-shrink-public-webm.ps1` (dry-run → run).
3. Обновил `images.ts` + `toursData.ts`.
4. Проверил рендер grid/viewer.
5. `npm run build`.
6. `npm run test:e2e:perf`.
7. `npx playwright test e2e/home-performance.spec.ts`.
8. ffprobe-аудит и итоговый отчёт.

Если любой пункт не проходит — merge блокируется до исправления.

