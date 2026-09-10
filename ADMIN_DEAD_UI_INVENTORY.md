# Dead UI Inventory — админка «Вкрайности»

Дата: 2026-08-18  
Область: основной CMS-контур. CRM исключён из текущего refactor scope.

## Classification

- **KEEP** — рабочий элемент с корректным interaction contract.
- **FIX** — действие/состояние существует, но контракт нарушен.
- **IMPLEMENT** — нужная бизнес-функция или объяснение отсутствует.
- **REMOVE** — ложный, дублирующий или неиспользуемый UI.
- **PLACEHOLDER** — будущая функция с явным и честным статусом.

| ID | Screen | Element | Evidence | Classification | User-visible problem | Required disposition |
|---|---|---|---|---|---|---|
| D1 | Shell | Quick add popover | `AdminChrome.tsx` renders a menu without Escape or outside-dismiss handling | FIX | Меню не имеет предсказуемого выхода с keyboard/pointer | Add Escape, focus return and outside dismiss |
| D2 | Dashboard | Attention empty state | `DashboardPage.tsx` checks queue for empty condition but does not render queue in attention list | FIX | При единственном pending publication отображается пустой список | Include queue attention rows or remove queue from condition |
| D3 | Dashboard | Readiness text | `DashboardPage.tsx` links to editor but not to blocker section | FIX | `4/5 готово` не отвечает, что исправлять | Link through blocker panel to the relevant section |
| D4 | Dashboard | `dashboardQuickActions` copy | Defined in `constants/ui.ts`, no consumer | REMOVE | Мёртвая copy создаёт ложный system intent | Remove unless a real quick-action section is designed |
| D5 | Tours | Card overflow menu | `AdminTourCard.tsx` has one entry that duplicates the primary card link | FIX | `…` выглядит как context menu, но не даёт контекстных действий | Add real actions or remove the menu |
| D6 | Tours | Unused season card | `AdminSeasonCard.tsx` has no product consumer | REMOVE | Поддерживается несуществующий flow season hub | Delete or restore a season overview intentionally |
| D7 | Tour editor | `publishNeedSave` copy | Defined in `constants/ui.ts`; no UI consumer | IMPLEMENT | Publish is disabled while dirty without reason | Show reason in sticky context / tooltip |
| D8 | Calendar | Cancel reason/comment | Dialog fields exist; `SchedulePage.tsx` changes only `status: 'cancelled'` | FIX | Оператор заполняет данные, которые теряются | Persist through API or remove fields before release |
| D9 | Calendar | Staff wizard step | `AddDepartureWizard.tsx` labels guide/driver as future development with disabled control | PLACEHOLDER | Шаг выглядит как незавершённый flow | Make it a non-blocking «Скоро» placeholder or remove from wizard |
| D10 | Calendar | Publication control | `SchedulePage.tsx` disables publish when no ids but gives no explanation | FIX | Неясно, почему primary action недоступен | Explain no changes / unpublished tour / blockers |
| D11 | Publication | Diff sheet | `InboxPage.tsx` compares only price, season or one date | IMPLEMENT | Reviewer не получает достаточный review context | Implement entity changes, readiness and validation summary |
| D12 | Users | Forbidden destination | `AdminApp.tsx` redirects non-admin from `/users` to `/` | FIX | Permission denial выглядит как неожиданный переход | Render an explicit forbidden state |
| D13 | Individual tours | Empty page | `IndividualToursPage.tsx` clearly says module will be connected later | KEEP | None: state is honest | Preserve as an explicit future-module placeholder |
| D14 | Leads navigation badge | `nav.ts` says `soon: true`, while `LeadsPage.tsx` is functional | OUT OF SCOPE | Misleading navigation; CRM excluded by current scope | Reassess when CRM enters scope |

## Required interaction contracts

### Cancel departure

```text
Trigger → permission → active departure
→ choose reason/comment → submitting
→ cancelled with persisted audit data
→ success toast + undo/reopen
→ failure restores prior state + retry
```

### Publish tour or schedule

```text
Trigger → capability → dirty / blockers / unpublished relationships
→ explicit enabled or disabled explanation
→ submitting/publishing
→ success state and updated draft/published context
→ failure with retry
```

### Dashboard attention

```text
Entity → specific issue → readiness/severity
→ direct next action
→ target editor/calendar section
```

## Exit criteria

An item may leave this inventory only when it is removed, converted to a visibly honest placeholder, or has a tested interaction contract with clear state, permission, loading, success, error and mobile/keyboard behaviour.
