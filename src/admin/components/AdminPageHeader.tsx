import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_UI } from '../constants/ui';

export type AdminBreadcrumbItem = {
  label: string;
  to?: string;
};

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
  secondary?: ReactNode;
  toolbar?: ReactNode;
  breadcrumbs?: readonly AdminBreadcrumbItem[];
};

const AdminPageHeader = ({
  title,
  description,
  meta,
  action,
  secondary,
  toolbar,
  breadcrumbs,
}: AdminPageHeaderProps) => (
  <div className="flex flex-col gap-4">
    {breadcrumbs != null && breadcrumbs.length > 0 ? (
      <nav aria-label={ADMIN_UI.breadcrumbs} className="text-xs text-text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {breadcrumbs.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.to != null ? (
                <Link className="no-underline hover:underline" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    ) : null}
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
