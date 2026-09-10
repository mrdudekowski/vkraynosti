# Desktop admin sidebar layout

## Status

Design approved in conversation; implementation has not started.

## Goal

Allow a desktop admin user to personalize the sidebar by reordering visible navigation items and swapping an item from the overflow catalog into a visible slot. The layout must remain compact, preserve access to every permitted page, and survive page reloads.

## Current context

- `AdminChrome` owns the shared admin shell and desktop sidebar.
- Navigation definitions come from `ADMIN_NAV_ITEMS`.
- Visibility is role/permission-dependent.
- The current navigation contains seven items.
- The collapsed-sidebar preference already uses `localStorage`.
- `AdminDialog`, modal focus handling, and existing admin surface styles are available for reuse.
- Mobile bottom navigation and tablet overlay navigation are separate surfaces and are out of scope for drag-and-drop.

## User workflow

The actor is an authenticated admin/editor using the admin workspace. The goal is to keep frequently used pages in the primary desktop sidebar while retaining access to every page permitted by the current session.

The workflow is:

1. The user sees up to eight navigation items in the desktop sidebar.
2. When more than eight permitted items exist, an `Ещё` control appears.
3. The user opens the overflow dialog to see the remaining permitted items.
4. The user may reorder visible items by dragging them within the sidebar.
5. The user may drag an overflow item onto a visible item. The two items exchange locations: the incoming item becomes visible and the displaced item returns to overflow.
6. The user may still click any item to navigate normally.
7. The resulting layout is restored after reload.

The quick-add control, profile control, logout control, collapse control, and other shell actions are not draggable navigation items.

## Product model

The layout is a per-browser user preference, not CMS data and not shared content. It must not modify routes, permissions, publication state, or backend data.

The normalized layout contains two ordered lists:

```ts
type AdminSidebarLayout = {
  visibleOrder: AdminNavId[];
  overflowOrder: AdminNavId[];
};
```

The model has these invariants:

- Every currently permitted navigation item occurs exactly once across both lists.
- `visibleOrder.length` is at most eight.
- Unknown, duplicated, or no-longer-permitted IDs are removed.
- Newly available permitted items are appended using the canonical navigation order.
- Shell actions are never represented by the model.

The default layout follows the canonical order from `ADMIN_NAV_ITEMS`, with the first eight permitted items visible and the remainder in overflow.

## Interaction design

### Visible sidebar

- Existing active, hover, focus, and compact states remain intact.
- A draggable navigation row exposes a drag affordance on hover/focus without changing its click target.
- During dragging, the source is visually muted and the target receives a clear insertion/replacement state.
- The sidebar does not grow beyond the existing navigation area.
- The `Ещё` control is shown only when overflow contains at least one item.
- In expanded mode it includes the label and hidden-item count when useful; in compact mode it has an accessible name and tooltip.

### Overflow dialog

- Reuse `AdminDialog` and existing admin surface tokens/classes; do not create a second modal or a new glassmorphism system.
- The dialog presents overflow items as a compact list/grid with icon, label, focus state, and drag affordance.
- Clicking an item navigates normally and closes the dialog.
- Dragging an overflow item onto a visible sidebar item performs the visible/overflow exchange.
- Escape, backdrop click, and close button close the dialog.
- Focus is trapped while open and restored to the `Ещё` trigger after close.
- The dialog explains the exchange behavior briefly: dragging an item onto a sidebar item swaps their positions.

### Keyboard and accessibility

Drag-and-drop is not the only way to change layout. Each draggable item must expose a keyboard alternative, using a small explicit move control or equivalent accessible action for moving an item through the visible order. Icon-only controls require accessible names. Focus-visible styling must remain visible on the dark sidebar and in the dialog.

### Responsive boundaries

- Desktop supports drag-and-drop and the eight-slot overflow model.
- Tablet keeps the existing overlay sidebar behavior; no new desktop drag interaction is required.
- Mobile keeps the existing bottom navigation and `MoreSheet`; it does not inherit the desktop layout preference.

## State and persistence

Use a versioned key:

```text
admin.sidebar.layout.v1
```

The stored value is JSON containing the two ordered lists and may include an informational timestamp. The timestamp is not used for correctness.

Persistence rules:

- Read once during initialization with a safe `localStorage` wrapper.
- Normalize against the current permitted item set before rendering.
- Write only after a completed reorder or exchange, not on every pointer-move event.
- If storage is unavailable, use the canonical layout for the current session.
- A malformed value must be ignored without disrupting navigation.
- The existing collapsed-sidebar preference remains independent.

Permission and catalog changes are handled at render time through normalization. A permission loss removes the item from both lists. A newly permitted item is appended in canonical order. No stale item may remain visible merely because it was saved previously.

## Component boundaries

Keep the existing `AdminChrome` ownership but isolate the new responsibilities:

- `useAdminSidebarLayout`: initialization, normalization, persistence, reorder, exchange, and reset.
- `AdminSidebarNav`: desktop visible list and draggable rows.
- `AdminSidebarOverflowDialog`: overflow catalog, dialog behavior, and drag source behavior.
- Pure layout helpers: default layout, normalization, reorder, and visible/overflow exchange.

The exact filenames may follow repository conventions, but the layout state must not be embedded as ad-hoc mutations throughout `AdminChrome`.

## Failure and feedback behavior

- Navigation remains usable if drag support is unavailable or storage fails.
- Invalid stored data silently falls back to a normalized default; no error toast is needed for ordinary recovery.
- A successful exchange may show a quiet toast such as `Раздел перемещён в сайдбар`.
- Reordering is reversible by another reorder, so no confirmation is required.
- Provide `Сбросить порядок` in the overflow dialog or its footer. Reset restores canonical order and saves it immediately.

## Testing and verification

### Pure logic tests

- default layout produces eight visible items and the remainder in overflow;
- normalization removes unknown IDs and duplicates;
- normalization removes items no longer permitted;
- newly permitted items are appended canonically;
- visible reorder preserves all IDs;
- overflow-to-visible exchange moves the incoming item into the target slot and returns the displaced item to overflow;
- reset restores the canonical layout.

### Component tests

- `Ещё` is absent with eight or fewer items and present with more than eight;
- active route remains active after reordering;
- clicking a navigation item still navigates;
- dialog focus and close behavior work through Escape, backdrop, and close button;
- keyboard alternative can reorder without a pointer;
- malformed or unavailable storage does not prevent rendering.

### End-to-end acceptance

On desktop, verify: load with nine permitted items; open `Ещё`; drag an overflow item onto a visible item; confirm exchange; reload; confirm the same layout; change viewport to compact mode; confirm labels/tooltips and active route; verify mobile and tablet navigation remain unchanged.

## Explicit non-goals

- No backend persistence or cross-device synchronization in v1.
- No CMS schema or API changes.
- No redesign of mobile navigation.
- No arbitrary sidebar resizing or user-created navigation items.
- No change to role/permission rules.
- No new visual design system; reuse existing admin tokens and components.

## Future extension

If cross-device synchronization becomes necessary, the same normalized `AdminSidebarLayout` can be stored in the authenticated user profile. The UI contract should remain unchanged; only the persistence adapter would change.
