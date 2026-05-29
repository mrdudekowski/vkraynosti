# optimize/ — реестр проблем и технического долга

Папка ведётся **агентом аудита** по [`docs/CODEBASE_CLEANUP_MASTER_AGENT_PROMPT.md`](../docs/CODEBASE_CLEANUP_MASTER_AGENT_PROMPT.md).

## Назначение

- Фиксировать находки **с доказательствами** (файлы, строки, команды).
- Не смешивать с пользовательской документацией в `docs/`.
- Давать команде **приоритизируемый backlog** очистки и рефакторинга.

## Правила

1. Одна проблема = один `.md` в подпапке категории.
2. Имя файла: `{severity}-{slug}.md` (например `high-duplicate-hero-phrase.md`).
3. Frontmatter — по шаблону [`_templates/FINDING.md`](_templates/FINDING.md).
4. Статус `hypothesis` — пока нет второй проверки; `confirmed` — можно планировать fix.
5. Исправления в коде — только по явному запросу; после fix обновить карточку (`status: fixed`).

## Файлы верхнего уровня

| Файл | Содержание |
|------|------------|
| [`INDEX.md`](INDEX.md) | Таблица всех карточек |
| [`SUMMARY.md`](SUMMARY.md) | Итог сессии, top risks, roadmap |

## Категории

| Папка | Тема |
|-------|------|
| `architecture/` | слои, связность, паттерны |
| `dead-code/` | неиспользуемый код |
| `ssot-duplication/` | дубли и нарушения SSOT |
| `legacy-patterns/` | устаревшие реализации |
| `broken-runtime/` | баги в prod-потоке |
| `dependencies/` | npm, неиспользуемые пакеты |
| `tests-and-quality/` | тесты, покрытие |
| `performance-bundle/` | perf, bundle, медиа-вес |
| `security-privacy/` | безопасность, PII |
| `design-system/` | токены, Tailwind, a11y визуал |
| `media-assets/` | `public/`, мёртвые ассеты |
| `documentation-dx/` | README, промпты, DX |
| `questions/` | открытые вопросы к команде |
| [`tailwind/`](tailwind/) | **глубокий Tailwind/design-system аудит** (`TW-*`) — см. [`docs/TAILWIND_EXPERT_DEEP_AUDIT_AGENT_PROMPT.md`](../docs/TAILWIND_EXPERT_DEEP_AUDIT_AGENT_PROMPT.md) |
| [`home-funnel/`](home-funnel/) | **воронка главной (core F0–F6)** (`HF-*`) — см. [`docs/HOME_FUNNEL_AUDIT_AGENT_PROMPT.md`](../docs/HOME_FUNNEL_AUDIT_AGENT_PROMPT.md) |

## ID находок

Формат: `OPT-YYYY-NNN` (порядковый в рамках года). Вести счётчик в `INDEX.md`.

## Последняя сессия

- **2026-05-27** — полный проход: 15 карточек + 1 вопрос. См. [`SUMMARY.md`](SUMMARY.md), [`INDEX.md`](INDEX.md), логи в [`_runs/`](_runs/).
