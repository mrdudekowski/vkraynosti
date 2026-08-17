type AdminEmptyStateProps = {
  title: string;
  description?: string;
};

const AdminEmptyState = ({ title, description }: AdminEmptyStateProps) => (
  <div className="rounded-admin-control border border-dashed border-divider px-3 py-4">
    <p className="text-sm font-medium text-text-primary">{title}</p>
    {description != null ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
  </div>
);

export default AdminEmptyState;
