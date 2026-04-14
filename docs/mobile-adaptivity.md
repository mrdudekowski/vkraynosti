# Мобильная адаптивность (навбар и сезоны)



Канонические брейкпоинты и токены — в [`tailwind.config.ts`](../tailwind.config.ts).



## Подпись сезона в шапке



- Текст названия сезона **справа от логотипа** в [`Navbar`](../src/components/layout/Navbar.tsx): виден от **`xs` (360px)** (`xs:inline`), с `truncate` при нехватке места.

- При **&lt;500px** справа от подписи — **статичный значок** активного сезона (иконка в круге) и отдельная **кнопка со стрелкой вниз**; панель [`SeasonNavDock`](../src/components/layout/SeasonNavDock.tsx) **под навбаром** (три остальных сезона: иконка + подпись) открывается и закрывается **только по этой стрелке**, без отдельной «плашки» у каждой кнопки сезона в панели.

- Состояние открыто/закрыто — [`SeasonNavMenuProvider`](../src/context/SeasonNavMenuProvider.tsx) / [`useSeasonNavMenu`](../src/context/useSeasonNavMenu.ts). Панель **сворачивается** при скролле, клике вне, Escape, выборе сезона, открытии бургер-меню.



## Иконки сезонов в строке навбара



- От **500px** размер фиксирован (`w-nav-season-circle-fixed`, `w-nav-season-icon-fixed`).

- До 500px полный ряд иконок в навбаре скрыт; мобильный выбор — кнопка в navbar + dock.



## Отступы контента



- `main`: только **`pt-16`** (фиксированный навбар `h-16`). Высота под dock **не резервируется**.

- Hero: **`h-hero-viewport`** — `calc(100vh - navbar)` на всех ширинах.



## Запуск e2e



```bash

npm run test:e2e

```



Требуется: `npx playwright install chromium`.

