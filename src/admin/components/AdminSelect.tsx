import type { SelectHTMLAttributes } from 'react';

type AdminSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
  className?: string;
  hasError?: boolean;
};

const AdminSelect = ({ className = '', hasError = false, ...props }: AdminSelectProps) => (
  <select className={`admin-input ${hasError ? 'admin-input-error' : ''} ${className}`.trim()} {...props} />
);

export default AdminSelect;
