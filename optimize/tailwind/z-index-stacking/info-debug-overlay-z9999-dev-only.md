---
id: TW-2026-008
title: z-[9999] TeamBackdropDebugOverlay — только DEV + localStorage
category: z-index-stacking
severity: info
status: confirmed
confidence: high
created: 2026-05-27
updated: 2026-05-27
modules: [M11]
files:
  - src/components/home/TeamBackdropDebugOverlay.tsx
  - src/utils/teamBackdropDebug.ts
effort: S
tags: [hypothesis-1]
related: []
---

# Debug overlay z-9999 — не production C1

## Вывод

Стартовая гипотеза **опровергнута** для prod: overlay рендерится только при `import.meta.env.DEV && localStorage.debugTeamBackdrop=1`.

```65:66:src/components/home/TeamBackdropDebugOverlay.tsx
  if (!isTeamBackdropDebugEnabled() || !sample) {
    return null;
```

`pointer-events-none` — не блокирует клики.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | hypothesis rejected for prod; info for dev hygiene |
