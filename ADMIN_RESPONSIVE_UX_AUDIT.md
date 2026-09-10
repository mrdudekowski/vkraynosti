# Admin tablet/mobile responsive UX audit

Дата: 2026-08-26  
Объект: `src/admin`, общая admin-оболочка и admin-стили в `src/index.css`  
Режим: read-only evaluation, без изменения поведения и данных.

## Executive evaluation

Текущее решение имеет хорошую базовую архитектуру: отдельные mobile/tablet/desktop viewport tiers, mobile bottom navigation, tablet overlay sidebar, adaptive sheets, локальный horizontal scroll для editor tabs и попытка компенсировать fixed profile/toast/sticky-bar. Но responsive-слой пока не является цельной operational-системой. Главные риски сосредоточены не в отдельных отступах, а в композиции приоритетов:

1. Tablet превращается в icon-only интерфейс, хотя это рабочая ширина, где пользователю нужна постоянная ориентация.
2. Fixed profile-menu размещён поверх контента и компенсируется непоследовательно.
3. Sticky context bar на mobile может занимать значительную часть viewport одновременно с bottom navigation и перекрывать рабочую область.
4. Расписание на tablet сохраняет desktop-like month grid и плотность, которая ухудшает чтение и попадание по элементам.
5. Некоторые toolbar/header группы переносятся без явного приоритета действий, поэтому primary/secondary actions визуально конкурируют.

Критичность: до исправления этих зон mobile/tablet нельзя считать полностью user-friendly для ежедневной работы редактора/менеджера.

## Priority matrix

| ID | Приоритет | Зона | Проблема | Риск |
|---|---|---|---|---|
| R1 | P0 | Tablet chrome | 768–1023 px получает только 68 px rail с иконками; название пунктов скрыто | Потеря ориентации, ошибки навигации, низкая discoverability |
| R2 | P0 | Fixed profile | Profile menu fixed `right:4 top:3`; компенсация `sm:mr-56/sm:pr-56` есть только у части header-компонентов | Заголовок, toolbar или action могут оказаться под профилем |
| R3 | P0 | Editor actions | Mobile editor одновременно имеет bottom nav и sticky publish/context bar; высота bar динамическая, а основной контент компенсирован не централизованно | Последние поля/CTA могут быть закрыты или требуют лишнего scroll |
| R4 | P1 | Schedule month | 7 колонок сохраняются на tablet/mobile; cell min width не задан, текст/thumbnail/actions сжимаются | Плохая читаемость, промахи, визуальная перегрузка |
| R5 | P1 | Schedule week/day | Для section-scroll на non-XL rail/workspace меняются в overflow-режимы, которые могут дать длинную страницу вместо предсказуемого рабочего viewport | Двойной scroll и потеря контекста |
| R6 | P1 | Header toolbars | `flex-wrap` переносит действия, но не задаёт порядок/overflow policy | Основное действие может уйти ниже/вторично выглядеть на narrow widths |
| R7 | P1 | Editor tabs | Horizontal scroll tabs технически есть, но нет явного scroll affordance или гарантии видимости active tab после смены | Пользователь не понимает, что есть скрытые разделы; active tab может быть вне viewport |
| R8 | P1 | CRM split | На tablet panel остаётся рядом с list только от `lg`; до этого list скрывается при выборе, что логично, но back/navigation зависит от panel UX | Возможна потеря контекста и высокий cost переключения |
| R9 | P2 | Dialogs/sheets | Dialog использует `p-4`, sheet mobile max-height `85vh`; для длинных форм мало гарантированной зоны footer/actions | Кнопки действий могут быть далеко после прокрутки |
| R10 | P2 | Readability | В расписании применяются `text-tooltip`/малые labels в узких cell; часть admin controls остаётся плотной | Слабая сканируемость и доступность на touch |

## Evidence and analysis

### R1 — tablet rail is too lossy

`useAdminViewport.ts` defines tablet as `min-width: 768` and desktop as `min-width: 1024`. In `AdminChrome.tsx`, `compact = viewport !== 'desktop' || collapsed`, while the visible sidebar uses `w-admin-rail` in compact mode. `NavRow` hides the label with `sr-only` when compact. Thus a 768–1023 px working viewport gets a permanent icon-only sidebar, not a temporary compact navigation.

Why this is operationally harmful: tablet is large enough for editor work, but the user cannot scan the section names or distinguish similar icons without hover/title behavior. The rail also consumes 68 px while the user still needs a menu overlay to recover full labels.

Recommendation: use a visible labeled sidebar at tablet when width allows, or replace the rail with a top app bar + explicit menu trigger. Keep icon-only rail as an intentional desktop preference only. If rail remains, add persistent page title + selected section label and test every icon at 768/834/1024 px.

### R2 — profile menu has a global collision contract

`AdminProfileMenu.tsx` is `fixed right-4 top-3 z-navbar`. `AdminPageHeader.tsx` and `ScheduleReferenceTopBar.tsx` reserve `sm:mr-56`/`sm:pr-56`, but `AdminPageFrame` and several page-local toolbars do not establish the same safe area. This creates a global overlay whose collision avoidance is local and incomplete.

Recommendation: make the shell own a responsive `--admin-topbar-safe-end` inset and apply it to every page header/tool row through `AdminPageFrame` or a shared header primitive. On mobile, use avatar-only profile with a full-width safe inset; on tablet, either move profile into the shell topbar or reserve a measured width, not an arbitrary 14rem.

### R3 — sticky actions compete with mobile navigation

`AdminChrome` adds `pb-navbar` to `#admin-main` on mobile. `AdminStickyContextBar` is sticky at `bottom-navbar` on mobile and `bottom-0` from `md`; the editor additionally adds `pb-28`. The bar contains a variable status area, optional problems action, secondary action and primary action, and mobile buttons are forced to full width.

This is directionally correct, but the compensation is split across unrelated components. A long status/error/disabled-hint message can increase the bar height beyond the assumed spacing, while the bottom nav remains fixed. The last interactive content has no single measured `scroll-padding-bottom` contract.

Recommendation: expose the measured sticky bar height through one shell-level CSS variable or use a fixed mobile action sheet with a compact status row. Set `scroll-padding-bottom` to `bottom-nav + action-bar + safe-area`, and verify editor at 360×800, 390×844 and 430×932 with blockers, autosave feedback and long Russian labels.

### R4 — calendar month is not a viable mobile/tablet composition

`admin-schedule-grid` remains `grid-cols-7` with `auto-rows-[minmax(5.5rem,1fr)]`; each day keeps `min-h-[5.5rem]`. Departure items use 28 px thumbnails and tooltip-sized labels. The month view is therefore a compressed seven-column desktop artifact, especially in the 768–834 px tablet portrait range and any mobile width.

Recommendation: mobile should default to agenda/day list; tablet portrait should use agenda or a horizontally scrollable calendar with explicit local scroll and a visible date rail. Keep month grid for wide tablet/desktop only, or define a tested minimum cell width and local horizontal scroll. Do not solve this by shrinking type.

### R5 — schedule scroll ownership is difficult to predict

For schedule section scrolling, `#admin-main` is set to `overflow:hidden`; the frame/stack/board/workspace also use nested `min-h-0`, `flex`, and `overflow:hidden`. Rail scrolling is only explicitly enabled at `xl`, while week-day lists have their own `overflow-y:auto`. On tablet this can create a combination of page-level and inner scrolling that is hard to discover, especially after the top bars and sticky actions consume height.

Recommendation: document one scroll owner per mode: page scroll for month/mobile agenda; one workspace scroll for desktop week split; no hidden scroll container on tablet unless a visible affordance and stable height exist. Add keyboard and touch verification for focus movement inside each scroll owner.

### R6/R7 — wrapped toolbars and tabs need priority behavior

`AdminPageHeader` and `ScheduleReferenceTopBar` use wrapping flex rows. `AdminEditorSectionTabs` uses local horizontal overflow, which is better than wrapping, but has no visible cue for overflow and does not explicitly scroll the newly selected tab into view.

Recommendation: define action tiers: page identity first, primary action second, secondary actions in overflow. On narrow widths, stack title and primary CTA, move nonessential actions into menu, and add a gradient/chevron scroll cue for tabs. After keyboard or programmatic tab change, call `scrollIntoView({ inline: 'nearest' })` for the active tab.

### R8 — CRM mobile pattern is sound but should be validated as a workflow

`LeadsPage.tsx` intentionally switches to list-or-detail on widths below `lg`, and `CrmPersonPanel` exposes a mobile back action. This is a good master-detail direction. The risk is not the layout rule itself, but whether selected state, scroll position, query/filter state and back navigation survive repeated transitions.

Recommendation: preserve list scroll position and filter state, announce the detail transition, and verify back behavior after editing, saving an error, and browser back. This is P1 workflow QA rather than a confirmed overlap defect.

## Positive patterns to preserve

- `AdminEditorSectionTabs` uses local horizontal scrolling instead of two-line tabs.
- `AdminSheet` has adaptive drawer/sheet/fullscreen placements and focus trapping.
- Mobile navigation reserves bottom space and provides a More sheet rather than squeezing every nav item.
- Touch pointers reveal schedule day add actions, avoiding hover-only controls.
- `min-w-0` is used broadly in list/detail layouts, reducing accidental flex overflow.
- Toast positioning attempts to account for both bottom navigation and sticky action bar.

## Recommended remediation order

1. Fix shell geometry: tablet navigation mode, global profile safe area, and unified bottom/action-bar scroll padding.
2. Replace mobile/tablet schedule month composition with agenda/day-first behavior.
3. Establish header/action priority and tab overflow affordance.
4. Validate schedule scroll ownership at 768, 834, 1024 and editor action states at 360, 390, 430.
5. Run touch/keyboard checks: 44 px targets, focus visibility, active tab visibility, dialog footer reachability, and no horizontal document overflow.

## Acceptance criteria for the next pass

- No document-level horizontal overflow at `360, 390, 430, 768, 834, 1024` px.
- No fixed profile, bottom nav or sticky action bar obscures a focused control.
- At tablet width, every primary admin destination is identifiable without guessing an icon.
- Schedule month is not the default dense seven-column interaction below the agreed breakpoint.
- Every mode has one obvious vertical scroll owner.
- Primary action remains visible and visually dominant after wrapping, validation errors and long Russian labels.
- Active editor tab is always scrolled into view after click/keyboard navigation.

## Scope note

This evaluation is repository/code evidence. It identifies high-confidence layout and interaction risks from the implemented responsive rules. A final visual sign-off still requires screenshot/runtime verification at the viewport matrix above, with authenticated representative states for dashboard, tours, editor, schedule, inbox and CRM.
