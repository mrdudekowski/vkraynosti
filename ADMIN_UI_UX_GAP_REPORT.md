# UI ↔ UX Gap Report — админка «Вкрайности»

Дата аудита: 2026-08-18  
Граница работ: основной контур CMS — shell, «Сегодня», туры, редактор тура, календарь, публикация и пользователи. CRM/«Заявки» намеренно исключён из текущего рефактора.

## Вывод

Админка уже содержит основу системного operational UI: единые маршруты и навигацию, role-based доступ, дизайн-токены, список базовых primitives и значительную часть loading/error/empty состояний. Массовая замена стилей не нужна.

Основной разрыв находится в interaction contracts: несколько действий или состояний не объясняют причину, не доводят пользователя до следующего шага либо собирают данные, которые затем не используют. Приоритет — исправить эти контракты до косметических изменений.

## 1. Карта экранов

| Screen | Route | Главное действие | Доступ | Состояние |
|---|---|---|---|---|
| Вход | `#/login` | Войти | гость | форма, ошибка, loading |
| Сегодня | `#/` | Открыть каталог | авторизованный | внимание, выезды, публикация |
| Туры | `#/tours/:season` | Добавить тур | авторизованный | сезоны, поиск, фильтры, card/list |
| Редактор тура | `#/tours/:tourId` | Сохранить / опубликовать | авторизованный, publish по capability | draft, readiness, blockers, autosave |
| Календарь | `#/schedule` | Создать выезд | авторизованный | day/week/month, draft/publish |
| Публикация | `#/inbox` | Опубликовать / отправить | capability-dependent | очередь, выбор, diff, возврат |
| Люди | `#/users` | Добавить пользователя | admin | роли, capabilities, delete |
| Индивидуальные туры | `#/individual` | — | авторизованный | честный placeholder |

Источник маршрутов: `src/admin/constants/routes.ts`; список навигации: `src/admin/constants/nav.ts`; auth и route guard: `src/admin/AdminApp.tsx`.

## 2. Current UI critique

### Global shell

**Сильные стороны**
- Sidebar → rail → bottom navigation реализованы как разные morphology (`src/admin/components/AdminChrome.tsx`).
- Есть skip-link, focus trap для мобильных overlay/sheet и global quick add.
- Пользователь и capability проверяются до рендера `UsersPage`.

**Разрывы**
- Quick add закрывается только повторным нажатием или переходом: нет Escape/click-outside контракта.
- В mobile bottom navigation не передаётся `aria-current="page"`, хотя desktop navigation делает это.
- «Создать выезд» в global quick add ведёт в календарь, а не открывает выбор контекста; это допустимо только если destination явно берёт на себя создание.

### Сегодня

**Сильные стороны**
- Экран загружает туры, выезды и очередь; использует skeleton и retry error state.
- Ближайшие и текущие выезды являются deep links в нужный выезд календаря.

**Разрывы**
- Attention считает публикационную очередь для выбора empty state, но не рендерит queue в этом блоке. Если есть только queue item, пользователь видит пустой список вместо причины внимания.
- Экраны editor и admin получают разную выборку queue, но attention ориентируется на полную queue — критерий «моего внимания» непоследователен.
- Строки readiness показывают только `N/M готово`; до блокирующей секции они не доводят.
- Publication items не показывают понятные entity/state/action в одной строке.

### Туры

**Сильные стороны**
- Поиск, visibility filter, list/card view и empty states уже реализованы.
- Карточка показывает visibility, readiness и ближайший выезд; открывает editor.

**Разрывы**
- `#/tours` сразу редиректит в текущий сезон: первый вход не даёт обзор сезонов и контекста.
- Обложка занимает слишком большую долю operational card (`src/admin/components/AdminTourCard.tsx`); информация важнее медиа.
- Readiness — текст без drill-down в blocker panel.
- Overflow menu содержит единственное действие «Открыть карточку», дублирующее click по card.
- List view не выводит отдельные колонки readiness, publication и nearest departure; все сведения сжаты в meta.

### Редактор тура

**Сильные стороны**
- Это наиболее зрелый экран: sticky context, section completion, autosave, blockers и переход в конкретную секцию уже есть.
- Draft/readiness/save feedback и capability-based submit/publish присутствуют.

**Разрывы**
- Когда publish disabled из-за несохранённых изменений, сообщение `publishNeedSave` существует в copy, но не показано.
- Верхний sticky context и нижняя action bar требуют проверки на пересечение с mobile bottom navigation.
- Редактор имеет собственную layout-оболочку вместо `AdminPageFrame`; это осознанное исключение, которое нужно формализовать.

### Календарь

**Сильные стороны**
- На mobile month morphology заменяется agenda/day mode.
- Есть wizard создания, sheet существующего выезда, drag move и undo.
- Загрузка, полный failure и mutation failure разведены.

**Разрывы**
- Header не показывает Draft Schedule / Published Schedule и число неопубликованных изменений.
- Disabled publish/submit не объясняет, что отсутствуют publishable departures или не опубликованы связанные туры.
- Календарная ячейка стилизована как отдельная card вместо цельной сетки.
- Event chip показывает тур и диапазон дат, но не status/capacity.
- Cancel dialog запрашивает причину и комментарий, но `SchedulePage` сохраняет только статус `cancelled`: введённые данные теряются.
- Wizard содержит disabled staff step как техническую заглушку, а не честный future-state.

### Публикация

**Сильные стороны**
- Есть tab-specific capability, multi-select, bulk action, return flow, empty/loading/error states.
- На экране одно главное действие.

**Разрывы**
- Diff ограничен price, season и start date. Reviewer не видит полноту изменений, readiness и validation перед выпуском.
- Для publish/submit current selection и scope не выражены в header/context bar.
- Ошибка mutation выдаётся toast без явной retry action.

### Люди

**Сильные стороны**
- Route guard, drawer edit flow, разграничение capabilities и destructive confirmation реализованы.

**Разрывы**
- Editor при ручном переходе на `#/users` молча отправляется на dashboard без permission explanation.
- Initial fetch error отображается нейтральным alert вместо retryable page error.
- Password action disabled по длине, но минимальное требование не объясняется до ошибки.

## 3. UI ↔ UX gap matrix

| Screen | Element | UI сейчас | Ожидание пользователя | Реальность | UX gap | Action | State | Loading / success / error | Permission | Mobile | Решение |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Shell | Quick add menu | Меню «Создать» | Закрыть predictably | Нет Escape/click-outside | overlay trap | Create | open | нет close feedback | auth | доступно | FIX |
| Dashboard | Attention | Returned + not ready | Полный список задач | Queue-only даёт пустой list | state condition не совпадает с content | Open issue | mixed | skeleton/retry есть | editor filter partial | rows доступны | FIX |
| Dashboard | Readiness row | `4/5 готово` | Найти блокер | Открывает editor без focus на section | no next action | Resolve | not ready | n/a | auth | работает | FIX |
| Tours | Overflow | `…` | Context actions | Дублирует card click | fake context menu | Open editor | any | n/a | auth | target есть | FIX / REMOVE |
| Tours | Card cover | Большое изображение | Узнать тур быстро | Мета вторична | marketing-card pattern | Open editor | any | n/a | auth | card mode | FIX |
| Tour editor | Publish disabled | Неактивная кнопка | Понять блокер | Причина save-needed отсутствует | unexplained disabled | Save | dirty | autosave есть; explanation нет | capability | bottom bar | FIX |
| Calendar | Publication | Publish/submit button | Знать draft/published delta | Контекст не показан | hidden business state | Publish | draft | busy/error есть | capability | agenda fallback | FIX |
| Calendar | Cancel dialog | Reason/comment fields | Причина сохранится | Данные игнорируются | broken data contract | Cancel | editing | error generic | auth | sheet/dialog | FIX |
| Calendar | Staff step | Disabled CTA | Честно знать будущую функцию | Функция выглядит частью flow | misleading placeholder | Continue | future | disabled | auth | wizard | PLACEHOLDER |
| Inbox | Diff | Несколько полей | Проверить выпуск | Не весь change set | insufficient review workspace | Review / publish | queued | loading/error есть | capability | sheet | IMPLEMENT |
| Users | Forbidden route | Redirect home | Понять отсутствие доступа | Причина не показана | silent permission failure | Back | forbidden | n/a | admin only | More sheet hides item | FIX |
| Individual | Empty page | «Подключим отдельно» | Понять roadmap | Честный placeholder | нет | — | future | n/a | auth | работает | KEEP |

## 4. Placeholder inventory

| ID | Location | Тип | Решение |
|---|---|---|---|
| P1 | `src/admin/IndividualToursPage.tsx` | Full-page honest placeholder | KEEP |
| P2 | `src/admin/components/AddDepartureWizard.tsx` staff step | Future action inside active wizard | PLACEHOLDER: label «Скоро» и убрать disabled-looking final action |
| P3 | `src/admin/components/AdminTourCard.tsx` | Fallback media | KEEP |
| P4 | `src/admin/constants/ui.ts` `dashboardQuickActions` | Unused copy | REMOVE или IMPLEMENT |
| P5 | `src/admin/constants/ui.ts` `publishNeedSave` | Unused copy needed for disabled state | IMPLEMENT |
| P6 | `src/admin/components/AdminSeasonCard.tsx` | Unused component | REMOVE unless season overview returns |

## 5. Design foundation

The target direction is **Adaptive Operational UI**:

- dense but calm information layout; surfaces only for objects, overlays and important states;
- one primary action per context;
- state is always expressed with text plus semantic status, never colour alone;
- hierarchy is title → context → action → state, not card decoration;
- table → two-line row → operational card across desktop/tablet/mobile;
- sidebar → rail → bottom nav, sheet/drawer → full-screen mobile sheet;
- controls use existing tokens (`adminUiTokens.ts`, `tailwind.config.ts`) and Lucide only.

Required reusable contracts:

| Primitive | Contract |
|---|---|
| `AdminPageHeader` | title, short context, one primary, secondary actions, toolbar |
| `AdminStickyContextBar` | entity state, readiness, blockers, save state, next action |
| `AdminDataList` | desktop columns; two-line tablet row; mobile operational card |
| `AdminStatus` / `AdminBadge` | text + semantic tone; never tone alone |
| `AdminEmptyState` | what happened, whether it is normal, next action |
| `AdminErrorState` | cause/context plus retry |
| `AdminSheet` | focus trap, Escape, clear dismiss; fullscreen on narrow viewports |
| `AdminTooltip` (new) | explanation for disabled/non-obvious control |
| `BlockerPanel` (new) | blocker → target section focus/scroll |

## 6. Refactor map

| Current component | Target responsibility |
|---|---|
| `AdminChrome` | Keep shell; add accessible menu dismissal and current mobile route state |
| `DashboardPage` + `HomeDepartureWidgets` | `OperationalDashboard` with Attention, Current, Next, Publication sections |
| `AdminTourCard` | compact `TourOperationalCard`; media thumbnail, status, readiness action, nearest departure |
| `TourList` + `AdminDataList` | `AdaptiveTourList` with explicit operational columns |
| `TourEditorPage` | Keep editor; extend `AdminStickyContextBar` disabled-reason contract |
| `SchedulePage` | `ScheduleToolbar`, `SchedulePublicationContext`, `CalendarEvent`, `DepartureDrawer` |
| `InboxPage` | `PublicationReviewList`, `PublicationDiffSheet` |
| `UsersPage` | `PeopleDataList`, forbidden state and retryable load error |

## 7. Implementation plan — proposal only

No UI refactor is authorised until this report is reviewed.

1. **Correct broken contracts:** dashboard queue-only empty case; cancel reason persistence or remove fields; publish-disabled reasons; remove/fix redundant overflow menu.
2. **Strengthen primitives:** tooltip for explained disabled states, responsive data-list variants, standardized toolbar and publication context.
3. **Shell and navigation:** accessible quick add dismissal, mobile current route semantics, explicit permission state.
4. **Rebuild dashboard:** attention rows with entity, issue, readiness/severity and direct next action; current/next/publication with useful metadata.
5. **Rework tours:** compact cards and full operational list columns; actionable readiness; season context.
6. **Rework calendar:** draft/published visibility, unified toolbar, grid event affordances, full departure drawer.
7. **Rework publication and people:** review-oriented diff and validation context; dense users list/drawer states.
8. **Responsive and accessibility pass:** 375/768/1024/1440, keyboard, focus order, Escape, reduced motion, no overlap with fixed bars.
9. **Verification:** targeted unit tests for state contracts, `npm run test`, `npm run build`, then relevant Playwright CMS flows.

## Acceptance checkpoint

Before implementation, confirm each visible control has:

1. a purpose and current business state;
2. permission decision;
3. loading, success and recoverable error behaviour;
4. an explained disabled state where needed;
5. keyboard and mobile access;
6. a direct next step or an honest placeholder.
