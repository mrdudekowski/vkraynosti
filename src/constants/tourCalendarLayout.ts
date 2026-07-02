/** Макс. ширина кнопки дня в сетке `DayPicker` (`tour-calendar` day_button). */
export const TOUR_CALENDAR_DAY_CELL_MAX_WIDTH = '2.75rem' as const;

/** Сетка месяца: нативная `<table>` (react-day-picker v9), равные 7 колонок. */
export const TOUR_CALENDAR_MONTH_GRID_CLASS =
  'w-full min-w-0 table-fixed border-collapse' as const;

/** Заголовок дня недели (ПН…ВС) в `<th>`. */
export const TOUR_CALENDAR_WEEKDAY_CLASS =
  'p-0.5 pb-2 text-center text-xs font-body uppercase tracking-wide text-text-muted' as const;

/** Ячейка дня в сетке главного календаря (`<td>`). */
export const TOUR_CALENDAR_DAY_CELL_CLASS = 'p-0.5 text-center align-middle' as const;

export const TOUR_CALENDAR_DAY_BUTTON_CLASS =
  'tour-calendar__day-btn mx-auto inline-flex aspect-square h-11 w-full max-w-tour-calendar-day-cell flex-col items-center justify-center overflow-hidden rounded-full font-body text-sm text-text-primary transition-colors duration-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-30 disabled:pointer-events-none' as const;

export const TOUR_CALENDAR_SELECT_DATE_PANEL_CLASS =
  'w-fit rounded-card border border-dashed border-divider bg-surface-light/80 px-4 py-3 text-center text-sm text-text-muted' as const;

/** Обёртка плашки «выберите дату»: слева на mobile/tablet, вправо в левой колонке на lg. */
export const TOUR_CALENDAR_SELECT_DATE_HINT_HOST_CLASS = 'mb-4 flex w-full lg:justify-end' as const;

/** Заголовок выбранного дня в панели событий (glass над фоном секции). */
export const TOUR_CALENDAR_DAY_HEADING_CLASS =
  'mb-4 w-fit rounded-card border border-divider bg-surface-light/75 px-4 py-2 font-heading text-lg capitalize text-text-primary shadow-sm backdrop-blur-sm' as const;

/** Сетка карточек: 1 колонка ≤580px, 2 колонки от 581px (`tour-calendar-day-events:`). */
export const TOUR_CALENDAR_DAY_EVENTS_GRID_CLASS =
  'grid min-w-0 grid-cols-1 items-stretch gap-2 tour-calendar-day-events:grid-cols-2' as const;

/** Ячейка сетки: растягивается по высоте строки, без breakpoint-вариантов. */
export const TOUR_CALENDAR_DAY_EVENTS_GRID_ITEM_CLASS = 'min-w-0' as const;

/** Компактная карточка тура в панели дня (обложка слева, контент справа). */
export const TOUR_CALENDAR_DAY_EVENT_CARD_CLASS =
  'group flex h-full w-full min-h-tour-calendar-day-event-card min-w-0 flex-row overflow-hidden rounded-lg border border-divider bg-surface-light/95 shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary' as const;

/** Вертикальная полоска сезона слева в карточке. */
export const TOUR_CALENDAR_DAY_EVENT_SEASON_STRIPE_CLASS = 'w-px shrink-0 self-stretch' as const;

/** Обложка слева (фикс. ширина, на всю высоту карточки). */
export const TOUR_CALENDAR_DAY_EVENT_MEDIA_CLASS =
  'h-full w-tour-calendar-day-event-media shrink-0 self-stretch overflow-hidden' as const;

/** Тело справа от обложки. */
export const TOUR_CALENDAR_DAY_EVENT_BODY_CLASS =
  'flex min-w-0 flex-1 flex-col justify-center gap-0.5 p-2' as const;

/** Заголовок: всегда резерв под 2 строки (`line-clamp-2`). */
export const TOUR_CALENDAR_DAY_EVENT_TITLE_CLASS =
  'line-clamp-2 min-h-tour-calendar-day-event-title font-heading text-xs leading-snug text-text-primary group-hover:text-brand-primary' as const;

/** Нижняя строка: тип · статус и цена. */
export const TOUR_CALENDAR_DAY_EVENT_FOOTER_CLASS =
  'flex min-h-tour-calendar-day-event-footer shrink-0 items-end justify-between gap-1' as const;

/** Скелетон карточки тура в панели дня (горизонтальная раскладка). */
export const TOUR_CALENDAR_DAY_EVENT_SKELETON_CLASS =
  'flex h-full w-full min-h-tour-calendar-day-event-card min-w-0 animate-pulse flex-row overflow-hidden rounded-lg bg-surface-light/60' as const;

/** Ширина обложки слева (`theme.extend.width`). */
export const TOUR_CALENDAR_DAY_EVENT_MEDIA_WIDTH = '4.5rem' as const;

/** Мин. высота горизонтальной карточки (`theme.extend.minHeight`). */
export const TOUR_CALENDAR_DAY_EVENT_CARD_MIN_HEIGHT = '5.25rem' as const;

/** Мин. высота блока заголовка под 2 строки `text-xs leading-snug` (`theme.extend.minHeight`). */
export const TOUR_CALENDAR_DAY_EVENT_TITLE_MIN_HEIGHT = '2.125rem' as const;

/** Мин. высота нижней строки мета + цена (`theme.extend.minHeight`). */
export const TOUR_CALENDAR_DAY_EVENT_FOOTER_MIN_HEIGHT = '1rem' as const;
