---
id: OPT-2026-014
title: Много docs/*_AGENT_PROMPT.md вне git
category: documentation-dx
severity: low
status: confirmed
confidence: high
created: 2026-05-27
updated: 2026-05-27
files:
  - docs/
effort: S
tags: [dx, prompts]
related: []
---

# Много docs/*_AGENT_PROMPT.md вне git

## Утверждение

В `git status` числятся неотслеживаемые промпты (`HOME_CONTACT_ACTION_CARD_STYLING`, `NAVBAR_BRIDGE_FADE`, `TOUR_BUTTONS_NOT_CLICKABLE`, `CODEBASE_CLEANUP_MASTER` и др.) — знания команды не в репозитории.

## Доказательства

Snapshot git status на старт сессии: `?? docs\..._AGENT_PROMPT.md`.

## Рекомендации

- [ ] Добавить в git нужные промпты или свести в один `docs/AGENTS.md` с ссылками.

## История

| дата | действие |
|------|----------|
| 2026-05-27 | создано, status: confirmed |
