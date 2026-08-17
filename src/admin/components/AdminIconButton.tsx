import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ButtonHTMLAttributes } from 'react';

type AdminIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconDefinition;
  label: string;
  danger?: boolean;
};

const AdminIconButton = ({ icon, label, danger = false, className = '', ...props }: AdminIconButtonProps) => (
  <button
    type="button"
    className={`${danger ? 'admin-icon-btn-danger' : 'admin-icon-btn'} ${className}`.trim()}
    aria-label={label}
    title={label}
    {...props}
  >
    <FontAwesomeIcon icon={icon} aria-hidden />
  </button>
);

export default AdminIconButton;
