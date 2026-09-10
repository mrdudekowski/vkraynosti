import type { ReactNode } from 'react';

type AdminDisabledHintProps = {
  children: ReactNode;
  id?: string;
};

const AdminDisabledHint = ({ children, id }: AdminDisabledHintProps) => (
  <p id={id} className="text-sm text-text-muted">
    {children}
  </p>
);

export default AdminDisabledHint;
