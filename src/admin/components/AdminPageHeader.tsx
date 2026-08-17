import type { ReactNode } from 'react';

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

const AdminPageHeader = ({ title, description, action }: AdminPageHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
      {description != null ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
    </div>
    {action != null ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export default AdminPageHeader;
