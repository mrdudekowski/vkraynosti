---

## id: OPT-2026-Q01

title: Воспроизводится ли баг кликов по турам сейчас?
category: questions
severity: —
status: resolved
confidence: —
created: 2026-05-27
updated: 2026-05-27
files:

- docs/TOUR_BUTTONS_NOT_CLICKABLE_DEBUG_AGENT_PROMPT.md
related: [OPT-2026-002]

# Воспроизводится ли баг кликов по турам сейчас?

## Вопрос

На текущей ветке / локально клики по `TourCard` и hero-ссылкам на тур **не работают** или проблема уже закрыта?

## Контекст

- Есть `docs/TOUR_BUTTONS_NOT_CLICKABLE_DEBUG_AGENT_PROMPT.md`.
- Статический код `Link` выглядит корректно; нужен runtime (desktop + mobile, GH Pages preview).

## Что проверить владельцу

1. `npm run dev` → главная → 3 карточки туров.
2. `npm run preview` с `base /vkraynosti/`.
3. Console errors при клике.

## Ответ (2026-05-27)

**Не воспроизводится.** Карточка OPT-2026-002 → `wont-fix`.