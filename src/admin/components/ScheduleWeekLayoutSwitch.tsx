import { Columns2, List } from 'lucide-react';
import type { ScheduleWeekLayout } from '../scheduleWeekLayout';
import { ADMIN_UI } from '../constants/ui';
import AdminButton from './AdminButton';
import AdminIcon from './AdminIcon';

type ScheduleWeekLayoutSwitchProps = {
  layout: ScheduleWeekLayout;
  onChange: (layout: ScheduleWeekLayout) => void;
};

const ScheduleWeekLayoutSwitch = ({ layout, onChange }: ScheduleWeekLayoutSwitchProps) => (
  <div className="flex gap-1" role="group" aria-label={ADMIN_UI.scheduleWeekLayout}>
    <AdminButton
      type="button"
      variant={layout === 'list' ? 'secondary' : 'ghost'}
      className="w-11 px-0"
      aria-pressed={layout === 'list'}
      aria-label={ADMIN_UI.scheduleWeekList}
      title={ADMIN_UI.scheduleWeekList}
      onClick={() => onChange('list')}
    >
      <AdminIcon icon={List} size={16} />
    </AdminButton>
    <AdminButton
      type="button"
      variant={layout === 'split' ? 'secondary' : 'ghost'}
      className="w-11 px-0"
      aria-pressed={layout === 'split'}
      aria-label={ADMIN_UI.scheduleWeekSplit}
      title={ADMIN_UI.scheduleWeekSplit}
      onClick={() => onChange('split')}
    >
      <AdminIcon icon={Columns2} size={16} />
    </AdminButton>
  </div>
);

export default ScheduleWeekLayoutSwitch;
