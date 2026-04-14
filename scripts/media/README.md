# Оптимизация медиа для страницы тура (grid + viewer)

## Идея

- **Viewer** (`tour.galleryImages`) — полное качество для полноэкранного просмотра и метаданных.
- **Grid** (`tour.galleryGridUrls`) — уменьшенные WebP и H.264 MP4 для сетки галереи и карточек; видео в сетке монтируется лениво с постером.

Длины массивов **обязаны совпадать** по индексам 1:1. Проверка: `src/data/tourGalleryParity.test.ts`.

## Именование файлов в `public/tours/{tourId}/`

| Файл | Назначение |
|------|------------|
| `name.webp` | Исходник для viewer (фото) |
| `name.grid.webp` | Сетка: webp после `scale` ≤900px по ширине |
| `clip.mp4` / `clip.mov` | Исходник для viewer (видео) |
| `name.grid.mp4` | Сетка: H.264, `crf` 28, без аудио |
| `name.poster.webp` | Кадр из `*.grid.mp4` для ленивого `<video>` |

## FFmpeg

Требуется `ffmpeg` в `PATH`. Общий вызов без конфликта с PowerShell: [`Invoke-Ffmpeg.ps1`](Invoke-Ffmpeg.ps1).

Скрипты по турам (из корня репозитория):

```powershell
.\scripts\generate-winter-1-grid-assets.ps1
.\scripts\generate-winter-2-grid-assets.ps1
.\scripts\generate-winter-3-grid-assets.ps1
.\scripts\generate-winter-4-grid-assets.ps1
.\scripts\generate-winter-5-grid-assets.ps1
```

## Новый тур

1. Положить исходники в `public/tours/{id}/`.
2. В [`src/constants/images.ts`](../../src/constants/images.ts): пары `*_GALLERY_VIEWER` и `*_GALLERY_GRID` (одинаковый порядок). Константы веток в [`TourDetailGallery`](../../src/components/tours/TourDetailGallery.tsx) — только из **grid**.
3. В [`src/data/toursData.ts`](../../src/data/toursData.ts): `galleryImages: [...VIEWER]`, `galleryGridUrls: [...GRID]`, `imageUrl` — обложка (часто `GRID[0]` или отдельный кадр).
4. Если в сетке есть видео: `TOUR_*_GRID_VIDEO_POSTERS` и в [`TourDetailPage`](../../src/pages/TourDetailPage.tsx) передача `getVideoPosterForGridSrc` для `tour.id`.
5. Скопировать ближайший `generate-winter-*-grid-assets.ps1`, подставить список файлов и вызовы `Invoke-Ffmpeg`.
