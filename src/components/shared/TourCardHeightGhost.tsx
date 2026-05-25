/**
 * Невидимый блок той же высоты, что контент `TourCard` (обложка h-48 + тело p-card-p).
 * Канон для overlay-карточек: expand «Показать все туры», teaser #safety.
 */
const TourCardHeightGhost = () => (
  <div className="invisible pointer-events-none flex flex-col" aria-hidden>
    <div className="h-48 shrink-0 overflow-hidden rounded-t-card" />
    <div className="p-card-p">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="min-h-6 w-11/12 max-w-full" />
          <div className="h-3.5 w-3/5" />
        </div>
        <div className="h-6 w-16 shrink-0 rounded-full" />
      </div>
      <div className="mb-3 space-y-2">
        <div className="h-3.5 w-full" />
        <div className="h-3.5 w-2/3" />
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <div className="h-4 w-28" />
        <div className="flex w-full flex-col items-end gap-1.5">
          <div className="h-6 w-32" />
          <div className="h-3 w-24" />
        </div>
      </div>
    </div>
  </div>
);

export default TourCardHeightGhost;
