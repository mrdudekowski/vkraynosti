# Оптимизация медиа для страницы тура (grid + viewer)

## Идея

- **Viewer** (`tour.galleryImages`) — полное качество для полноэкранного просмотра и метаданных.
- **Grid** (`tour.galleryGridUrls`) — уменьшенные WebP и VP9 WebM для сетки галереи и карточек; видео в сетке монтируется лениво с постером.

Длины массивов **обязаны совпадать** по индексам 1:1. Проверка: `src/data/tourGalleryParity.test.ts`.

## Именование файлов в `public/tours/{tourId}/`

| Файл | Назначение |
|------|------------|
| `name.webp` | Исходник для viewer (фото) |
| `name.grid.webp` | Сетка: webp после `scale` ≤900px по ширине |
| `clip.webm` | Viewer: VP9 из исходного `*.mov` / `*.mp4` (`WebmTourEncoding.ps1`, пресет `full`) |
| `name.grid.webm` | Сетка: VP9, пресет `grid`, без аудио |
| `name.poster.webp` | Кадр из `*.grid.webm` для ленивого `<video>` |

Исходники `*.mov` / `*.mp4` держите как мастера для повторного прогона скриптов (ветки зимы — в папках туров; весна — положите `*.mp4` снова перед `npm run generate:spring-clips`, либо восстановите из истории VCS). Отдача на сайте — только `*.webm`.

## FFmpeg

Общий вызов: [`Invoke-Ffmpeg.ps1`](Invoke-Ffmpeg.ps1) (на Windows после `npm i` — bundled `@ffmpeg-installer`, иначе `ffmpeg` из `PATH`).

Параметры VP9: [`WebmTourEncoding.ps1`](WebmTourEncoding.ps1) — синхронно с `scripts/generate-home-season-banner-loop-videos.cjs` (пресет `banner` для лупов баннера).

Скрипты по турам (из корня репозитория):

```powershell
.\scripts\generate-winter-1-grid-assets.ps1
.\scripts\generate-winter-2-grid-assets.ps1
.\scripts\generate-winter-3-grid-assets.ps1
.\scripts\generate-winter-4-grid-assets.ps1
.\scripts\generate-winter-5-grid-assets.ps1
.\scripts\generate-spring-2-3-tour-videos.ps1
npm run generate:banner-loops
```

## Новый тур

1. Положить исходники в `public/tours/{id}/`.
2. В [`src/constants/images.ts`](../../src/constants/images.ts): пары `*_GALLERY_VIEWER` и `*_GALLERY_GRID` (одинаковый порядок). Константы веток в [`TourDetailGallery`](../../src/components/tours/TourDetailGallery.tsx) — только из **grid**.
3. В [`src/data/toursData.ts`](../../src/data/toursData.ts): `galleryImages: [...VIEWER]`, `galleryGridUrls: [...GRID]`, `imageUrl` — обложка (часто `GRID[0]` или отдельный кадр).
4. Если в сетке есть видео: `TOUR_*_GRID_VIDEO_POSTERS` и в [`TourDetailPage`](../../src/pages/TourDetailPage.tsx) передача `getVideoPosterForGridSrc` для `tour.id`.
5. Скопировать ближайший `generate-winter-*-grid-assets.ps1`, подставить список файлов и вызовы `Invoke-Ffmpeg` / `WebmTourEncoding.ps1`.
