import type { ReactNode } from 'react';

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
  secondary?: ReactNode;
  toolbar?: ReactNode;
};

const AdminPageHeader = ({
  title,
  description,
  meta,
  action,
  secondary,
  toolbar,
}: AdminPageHeaderProps) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-admin-page text-text-primary">{title}</h1>
        {description != null ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
        {meta != null ? <div className="mt-1 text-sm text-text-muted">{meta}</div> : null}
      </div>
      {action != null || secondary != null ? (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:mr-56 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {secondary}
          {action}
        </div>
      ) : null}
    </div>
    {toolbar != null ? <div>{toolbar}</div> : null}
  </div>
);

export default AdminPageHeader;
