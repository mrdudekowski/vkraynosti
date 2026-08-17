import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type AdminButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant;
  children: ReactNode;
};

const VARIANT_CLASS: Record<AdminButtonVariant, string> = {
  primary: 'admin-btn-primary',
  secondary: 'admin-btn-secondary',
  ghost: 'admin-btn-ghost',
  destructive: 'admin-btn-destructive',
};

const AdminButton = ({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}: AdminButtonProps) => (
  <button type={type} className={`${VARIANT_CLASS[variant]} ${className}`.trim()} {...props}>
    {children}
  </button>
);

export default AdminButton;
