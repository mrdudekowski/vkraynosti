# Favicon админки

## Цель

Показывать знак админки «Вкрайности» в favicon для локальной и production-сборки админского приложения.

## Решение

Использовать существующие файлы `public/admin-favicon.svg`, `public/admin-favicon-32.png` и `public/admin-favicon.png`, созданные на основе знака админки `public/logo.svg`. Подключить их в `admin-app.html`, потому что именно этот файл указан входом в `vite.admin.config.ts` и затем копируется сборочным плагином в `dist-admin/index.html`.

## Объём

- Добавить SVG favicon и PNG-варианты 32×32 и 512×512 в `<head>` фактического entry-файла.
- Не менять существующие изображения, React-компоненты или пользовательские рабочие изменения.
- Проверить `npm run build:admin` и наличие favicon-ссылок в итоговом `dist-admin/index.html`.
