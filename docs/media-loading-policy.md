# Media Loading Policy

This policy keeps media loading aligned with current user context.

## Route-first

- Load heavy media only for the active route.
- Keep home banner loop `<head>` preloads capped to one clip per season.
- Avoid adding new global preloads for tour gallery media.

## Viewport-first

- Heavy `<video>` sources must be attached only after viewport entry or near-viewport intent.
- Grid videos must pause when tiles leave viewport.
- Offscreen promo videos must unmount back to poster when the block is out of view.

## Visibility-aware

- When `document.visibilityState !== 'visible'`, videos must pause.
- Hidden-tab playback is allowed only after explicit future exception and profiling evidence.

## Priority Hygiene

- Use `fetchPriority="high"` only for a real LCP candidate (hero image / first critical poster).
- Non-critical media should use lazy loading and low/default fetch priority.

## Guardrails

- Keep season banner head preload count at or below one clip.
- Validate media request budgets in perf tests before merging large media changes.
- Any new heavy media asset must document source script and expected size budget.
