# Tour Deletion Admin Design

## Status

Approved by the product owner on 2026-09-09.

## Goal

Allow an administrator to permanently delete a tour from the three-dot tour menu while protecting schedule and CRM integrity and clearly notifying the administrator about the result.

## Scope

This feature covers the CMS tour entity and its admin workflow. Deletion is physical and irreversible. It does not add soft-delete, archive, undo, bulk deletion, or deletion of related operational records.

## Workflow reconstruction

```text
Entity: CMS tour
Actor: authenticated administrator
Goal: remove obsolete tour content from CMS
Entry point: three-dot actions menu on the season tour card/list row
Lifecycle: draft or published tour; deletion removes the entity
Dependencies: schedule departures and CRM applications
External effect: published tour content is removed from CMS storage; the site receives the change only through the existing publication flow
Risk: irreversible content and media deletion
Feedback: confirmation dialog, loading state, success toast, or a specific blocking/error message
```

## Business rules

1. Only the authenticated admin action may invoke deletion; the backend is the source of truth for authorization and validation.
2. The backend must return `404 not_found` when the tour does not exist.
3. The backend must refuse deletion when the tour has any related departures or CRM applications. It returns a stable conflict error, `tour_has_dependencies`, with enough information for the admin UI to explain that dependencies must be removed first.
4. When no dependencies exist, deletion removes the tour's draft document, draft metadata, published per-tour document, published catalog entry, draft-index entry, and CMS-owned media objects.
5. External media URLs are not owned by the CMS tour and must not be deleted.
6. The operation has no undo. The confirmation must explicitly state that the action cannot be reversed.
7. On success, the admin list cache is invalidated/refreshed, the dialog closes, the administrator remains on the current season list, and a success toast is shown.
8. On failure, the dialog remains open, loading ends, and the UI shows a specific dependency message for `tour_has_dependencies` or a generic failure message for unexpected errors.

## Proposed approaches

### Chosen: dedicated DELETE endpoint with a deletion service

Add `DELETE /api/cms/tours/:id`. The route validates the ID and delegates dependency checks and CMS object cleanup to a focused backend service. The admin API adapter calls this endpoint, while `SeasonToursPage` owns dialog state, cache refresh, navigation context, and toasts.

This keeps destructive behavior explicit, testable, and separate from ordinary tour updates. It also ensures that another client cannot bypass the dependency guard.

### Rejected: update endpoint with a deletion flag

This would mix irreversible lifecycle behavior with content editing and make accidental invocation more likely.

### Rejected: frontend-only removal

This would not delete CMS objects reliably and could leave published content, metadata, or media orphaned.

## Admin UX

- Add a destructive menu item `Удалить тур` to the existing `AdminTourActionsMenu`, alongside clone and visibility actions.
- Open a focused `AdminDialog` titled `Удалить тур?`.
- Show the tour title and the explicit warning: `Тур, его контент и медиа будут удалены без возможности восстановления.`
- Use existing design-system primitives and the existing toast provider.
- The confirm button is visually destructive and becomes disabled while the request is running. The cancel action remains available before submission.
- The dialog has an accessible name, keyboard focus restoration, and a programmatically associated error/status region.

## Backend data flow

```text
DELETE request
  -> validate tour ID and load current tour
  -> check departures and CRM applications
  -> if dependencies exist: 409 tour_has_dependencies
  -> collect owned media keys and catalog/index updates
  -> delete CMS documents, metadata, index/catalog references, and owned media
  -> return 204 No Content
```

The implementation must use the existing `CmsJsonStore` abstraction and existing CMS key helpers. Cleanup should be deterministic and should not delete objects outside the tour's own CMS media prefix.

## Testing and verification

Backend tests cover:

- missing tour returns `404`;
- departures block deletion with `409 tour_has_dependencies`;
- CRM applications block deletion with the same conflict;
- a draft-only tour is physically removed;
- a published tour is removed from per-tour storage and catalog;
- draft index membership is removed;
- CMS-owned media is deleted while external media is preserved.

Admin tests cover:

- delete action is available from the three-dot menu;
- opening the action requires confirmation;
- cancel leaves the tour intact;
- repeated submission is prevented while busy;
- dependency error keeps the dialog open and shows the correct message;
- successful deletion calls the adapter, refreshes the list, closes the dialog, and shows a toast.

Release verification runs focused tests, typecheck, admin build, backend API tests where the local database/store dependencies are available, and `git diff --check`. Existing unrelated dirty files remain untouched.

## Pre-implementation brief

```text
Affected workflow: remove obsolete CMS tour content
Primary user: authenticated CMS administrator
Primary goal: permanently delete a tour only when no operational records depend on it
Current behavior: no tour deletion action exists in the admin tour menu
Relevant entities/state: draft/published tour documents, tour metadata, published catalog, draft index, media, departures, CRM applications
Existing design primitives to reuse: AdminTourActionsMenu, AdminDialog, AdminButton, AdminAlert, AdminToastProvider, admin API adapters, CmsJsonStore and CMS key helpers
Main UX problems: deletion is unavailable; a destructive action must not be hidden behind a silent mutation
Proposed UI composition: destructive menu item -> focused confirmation dialog -> success/error toast and list refresh
L1 changes: menu item, dialog layout, loading/error feedback
L2/L3 changes: irreversible deletion policy and dependency blocking, approved above
Verification scenarios: success, cancel, busy, missing tour, dependencies, storage cleanup, unexpected failure
```
