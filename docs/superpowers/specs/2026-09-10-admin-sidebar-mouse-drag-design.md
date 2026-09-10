# Admin Sidebar Mouse-Only Drag Design

## Goal

Make desktop sidebar rearrangement visually quiet and direct: users move navigation items with the mouse only, without visible up/down controls and without changing the dragged item's appearance. The drop target is communicated by a thin insertion line on the row where the item will land.

## Scope

- Desktop admin sidebar only.
- Visible sidebar items can be reordered by native HTML5 mouse drag-and-drop.
- Items from the desktop overflow dialog can still be dragged onto a visible sidebar row to exchange places.
- Existing persisted layout format and `localStorage` key remain unchanged.
- Mobile and tablet navigation behavior remains unchanged.
- Keyboard reorder actions and visible arrow controls are removed.

## Interaction model

1. A user presses and holds the primary mouse button on a sidebar navigation row.
2. The row remains visually normal while dragging; no opacity reduction, replacement ghost, or “captured” styling is applied to the source row.
3. While the pointer crosses another row, calculate whether the insertion point is before or after that row using its vertical midpoint.
4. Render a thin horizontal insertion line at that position. The line is the only persistent drop affordance.
5. On mouse release, reorder visible items or exchange an overflow item with the targeted visible item.
6. If the pointer leaves the valid drop area or the drag is cancelled, remove the line and leave the layout unchanged.

## Component boundaries

- `AdminSidebarNav` owns row-level drag events and insertion-target state.
- `AdminChrome` owns the layout mutation callback and coordinates overflow-dialog drag state with the underlying sidebar.
- `AdminSidebarOverflowDialog` keeps its existing glassmorphism/modal shell and exposes the same drag payload, but no longer offers non-mouse movement controls.
- Existing layout helpers and `useAdminSidebarLayout` remain responsible for ordering, normalization, persistence, and reset behavior.
- Existing admin navigation classes and tokens are reused for the line; no parallel visual system is introduced.

## Visual and accessibility behavior

- Remove `↑` and `↓` buttons, labels, and related callbacks from the sidebar rows.
- Do not add a new keyboard reorder interaction because the approved behavior is mouse-only.
- Keep the navigation links themselves usable for normal click navigation.
- Keep the overflow trigger keyboard-focusable for opening the dialog and closing it.
- The insertion line must not shift row layout; it should be absolutely positioned or otherwise rendered without changing document flow.
- The line must be visible against the existing brand-primary sidebar background and use existing border/divider color tokens.

## State and persistence

The current `admin.sidebar.layout.v1` payload remains the source of truth. Drag completion calls the existing reorder/exchange functions, which persist the normalized visible and overflow orders. Cancelled or invalid drags do not write state.

## Edge cases

- Dropping an item on itself is a no-op.
- Dropping between rows uses the before/after insertion position and produces deterministic order.
- Dragging from overflow over the modal overlay continues to reach the sidebar as currently supported.
- Closing the overflow dialog or leaving the valid target area clears all transient drag state.
- Permission changes or newly available navigation items continue to be normalized by the existing layout hook.

## Verification

- Unit/component tests assert that arrow controls are absent.
- Tests assert that a drag target renders an insertion line and does not apply the previous opacity/captured class.
- Tests cover before/after drop positions for visible items.
- Tests cover overflow-to-sidebar exchange with the insertion target.
- Existing sidebar persistence, normalization, focus restoration, typecheck, lint, and targeted test suites remain green.
