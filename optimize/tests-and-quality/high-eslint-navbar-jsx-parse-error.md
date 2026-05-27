---
id: OPT-2026-003
title: ESLint падает на Navbar.tsx (parse error)
category: tests-and-quality
severity: high
status: fixed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - src/components/layout/Navbar.tsx
effort: S
tags: [ci, eslint]
related: [OPT-2026-002]
---

# ESLint падает на Navbar.tsx (parse error)

## Утверждение

`npm run lint` завершается с ошибкой парсинга JSX в `Navbar.tsx` (строка 139), хотя `tsc` и `vite build` проходят.

## Доказательства

### 1. Статический след

```bash
npm run lint
# → Navbar.tsx:139:7 Parsing error: JSX element 'div' has no corresponding closing tag
```

Лог: `optimize/_runs/2026-05-27-lint.log`

### 2. Пример в коде

```137:149:src/components/layout/Navbar.tsx
  return (
    <nav data-layout-navbar className="fixed top-0 left-0 right-0 z-navbar">
      <div
        className={`relative ${navShellTransition} ${navShellPointerEvents}`.trim()}
        style={{ opacity: navShellOpacity }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-navbar-chrome bg-home-gate-start-screen"
        />
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
```

Рядом: `createPortal(<>...</>, document.body)` (строки 267–312), закрывающие `</div>` на 313–315.

### 3. Runtime / build

- `npm run build`: **pass**
- `npm run lint`: **fail** (1 error)

## Влияние

- **Пользователь:** нет (если разметка валидна для SWC).
- **Разработка:** CI с lint не зелёный; риск пропустить реальную незакрытую разметку.
- **Риск регрессии при fix:** только форматирование/обёртка portal.

## Корневая причина (гипотеза)

Либо реально несбалансированные `<div>` вокруг portal, либо ограничение ESLint-парсера на `createPortal` + fragment.

## Рекомендации

### Минимальный fix (безопасный)

- [ ] Явно отформатировать вложенность `div` (indent) и проверить парность тегов.
- [ ] Обернуть содержимое portal в `<div>` вместо `<>` если парсер ломается.

### Идеальный fix

- [ ] Вынести mobile menu portal в подкомпонент `NavbarMobileMenu.tsx` для читаемости.

## Чеклист проверки

- [x] lint log сохранён
- [ ] После правки: `npm run lint` green

## Вопросы к команде

Нет.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
| 2026-05-27 | fix: `NavbarMobileMenuPortal`, выровнена вложенность div, `npm run lint` pass |
