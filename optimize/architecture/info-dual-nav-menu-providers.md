---
id: OPT-2026-013
title: Два контекста меню — season vs mobile (by design?)
category: architecture
severity: info
status: confirmed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - src/context/SeasonNavMenuProvider.tsx
  - src/context/MobileNavMenuProvider.tsx
  - src/components/layout/Layout.tsx
effort: S
tags: [context, navbar]
related: [OPT-2026-002]
---

# Два контекста меню — season vs mobile (by design?)

## Утверждение

В `Layout` вложены `SeasonNavMenuProvider` и `MobileNavMenuProvider` — параллельные источники truth для «меню открыто», не баг сами по себе.

## Доказательства

```77:83:src/components/layout/Layout.tsx
      <SeasonNavMenuProvider>
        <MobileNavMenuProvider>
          <HomeNavbarChromeProvider>
            <LayoutChrome />
```

Navbar использует оба хука (`useSeasonNavMenu`, `useMobileNavMenu`).

## Влияние

- Усложнение расследования overlay-багов (два overlay).
- Документировать инвариант: при открытии одного закрывать другой (проверить в Navbar handlers).

## Рекомендации

- [ ] При fix tour clicks — проверить взаимное исключение season dock / burger menu.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
