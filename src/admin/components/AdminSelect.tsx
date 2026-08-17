import type { SelectHTMLAttributes } from 'react';

type AdminSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
  className?: string;
};

const AdminSelect = ({ className = '', ...props }: AdminSelectProps) => (
  <select className={`admin-input ${className}`.trim()} {...props} />
);

export default AdminSelect;
