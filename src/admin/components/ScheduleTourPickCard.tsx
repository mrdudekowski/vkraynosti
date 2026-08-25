import TourCoverImage from './TourCoverImage';

type ScheduleTourPickCardProps = {
  title: string;
  imageUrl: string | null | undefined;
  selected: boolean;
  onSelect: () => void;
};

const ScheduleTourPickCard = ({ title, imageUrl, selected, onSelect }: ScheduleTourPickCardProps) => (
  <button
    type="button"
    aria-pressed={selected}
    aria-label={title}
    className={`flex w-full min-w-0 items-center gap-3 rounded-admin-control border px-2 py-2 text-left transition-colors duration-admin motion-reduce:transition-none ${
      selected
        ? 'border-brand-primary/40 bg-brand-primary/15 ring-1 ring-brand-primary/30'
        : 'border-divider bg-surface-light hover:bg-brand-primary/5'
    }`}
    onClick={onSelect}
  >
    <TourCoverImage
      src={imageUrl}
      alt=""
      className="h-12 w-16 shrink-0 rounded-admin-control"
    />
    <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-text-primary line-clamp-2">
      {title}
    </span>
  </button>
);

export default ScheduleTourPickCard;
