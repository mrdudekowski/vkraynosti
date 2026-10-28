import { ADMIN_UI } from '../constants/ui';

type AdminIncidentStripProps = {
  onOpenDialog: () => void;
};

const AdminIncidentStrip = ({ onOpenDialog }: AdminIncidentStripProps) => (
  <button
    type="button"
    role="alert"
    className="admin-alert-danger w-full rounded-none border-x-0 border-t-0 text-left"
    onClick={onOpenDialog}
  >
    {ADMIN_UI.incident.media_down.title}
  </button>
);

export default AdminIncidentStrip;
