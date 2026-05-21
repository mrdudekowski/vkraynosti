# Полуостров Гамова media

Файлы подключены в `src/constants/images.ts` как `TOUR_SPRING_13_*`.

Фото:

- `cover.webp` — обложка карточки и hero страницы (`content/HERO/Весна/Gamova.webp`).
- `preface.webp` — фон блока «О туре».
- `vityaz-bay.webp` — входная точка маршрута / бухта Витязь.
- `gamov-view.webp` — видовая панорама, бывшая обложка до замены hero.
- `gamov-panorama.webp` — панорама полуострова Гамова.
- `telyakovsky-bay.webp` — бухта Теляковского и сосны.
- `summit-view.webp` — видовая точка на острова и скалы.
- `astafiev-bay.webp` — берег Астафьева.

Видео:

- `gam.clip1.webm`, `gam.clip2.webm`, `gam.clip3.webm`, `gam.clip4.webm` — viewer-версии.
- `gam.clip1.grid.webm`, `gam.clip2.grid.webm`, `gam.clip3.grid.webm`, `gam.clip4.grid.webm` — сетка галереи.
- `gam.clip1.poster.webp`, `gam.clip2.poster.webp`, `gam.clip3.poster.webp`, `gam.clip4.poster.webp` — постеры для ленивой загрузки grid-видео.

Порядок `TOUR_SPRING_13_GALLERY_GRID`:

1. `cover.webp`
2. `preface.webp`
3. `gam.clip2.grid.webm`
4. `vityaz-bay.webp`
5. `gamov-view.webp`
6. `gamov-panorama.webp`
7. `telyakovsky-bay.webp`
8. `gam.clip1.grid.webm`
9. `gam.clip3.grid.webm`
10. `summit-view.webp`
11. `astafiev-bay.webp`
12. `gam.clip4.grid.webm`

После `galleryGridUrls.slice(2)` в `TourDetailGallery` приходит 10 элементов: `clip2`, `vityaz-bay`, `gamov-view`, `gamov-panorama`, `telyakovsky-bay`, `clip1`, `clip3`, `summit-view`, `astafiev-bay`, `clip4`.

Пересборка медиа:

```powershell
.\scripts\encode-spring-13-gamova-media.ps1
```
