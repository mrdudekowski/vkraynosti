import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import AdminIcon from './AdminIcon';

type AdminEditorSurfaceProps = {
  icon: LucideIcon;
  title: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

const AdminEditorSurface = ({ icon, title, hint, className = '', children }: AdminEditorSurfaceProps) => (
  <section className={`admin-editor-surface flex flex-col gap-2 ${className}`.trim()}>
    <header className="flex items-start gap-2">
      <span className="admin-editor-icon-well">
        <AdminIcon icon={icon} size={16} />
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {hint != null ? <p className="text-tooltip text-text-muted">{hint}</p> : null}
      </div>
    </header>
    {children}
  </section>
);

export default AdminEditorSurface;
