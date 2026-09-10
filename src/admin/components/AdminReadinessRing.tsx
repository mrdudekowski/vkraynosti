import { Leaf } from 'lucide-react';
import { ADMIN_UI } from '../constants/ui';
import AdminIcon from './AdminIcon';

type AdminReadinessRingProps = {
  ready: number;
  total: number;
  compact?: boolean;
};

const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const AdminReadinessRing = ({ ready, total, compact = false }: AdminReadinessRingProps) => {
  const percent = total === 0 ? 0 : Math.round((ready / total) * 100);
  const offset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * percent) / 100;

  return (
    <div className="flex items-center gap-2">
      <div className={compact ? 'relative h-10 w-10 shrink-0' : 'relative h-11 w-11 shrink-0'}>
        <svg viewBox="0 0 40 40" className={compact ? 'h-10 w-10 -rotate-90' : 'h-11 w-11 -rotate-90'} aria-hidden>
          <circle
            cx="20"
            cy="20"
            r={RING_RADIUS}
            fill="none"
            className="stroke-surface-dark/15"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r={RING_RADIUS}
            fill="none"
            className="stroke-brand-primary transition-[stroke-dashoffset] duration-admin motion-reduce:transition-none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-brand-primary">
          <AdminIcon icon={Leaf} size={16} />
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-tooltip text-text-muted">{ADMIN_UI.editorReadinessCard}</p>
        <p className="text-sm font-semibold text-text-primary">{percent}%</p>
      </div>
    </div>
  );
};

export default AdminReadinessRing;
