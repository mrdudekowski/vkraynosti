import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { ADMIN_UI } from '../constants/ui';

type AdminTextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  className?: string;
  hasError?: boolean;
};

export const AdminTextInput = ({ className = '', hasError = false, ...props }: AdminTextInputProps) => (
  <input
    className={`admin-input ${hasError ? 'admin-input-error' : ''} ${className}`.trim()}
    {...props}
  />
);

type AdminTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  className?: string;
  hasError?: boolean;
};

export const AdminTextArea = ({ className = '', hasError = false, ...props }: AdminTextAreaProps) => (
  <textarea
    className={`admin-textarea ${hasError ? 'admin-input-error' : ''} ${className}`.trim()}
    {...props}
  />
);

type AdminFieldLabelProps = {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
};

export const AdminFieldLabel = ({ htmlFor, children, required = false }: AdminFieldLabelProps) => (
  <span className="flex flex-wrap items-baseline gap-x-1">
    <label htmlFor={htmlFor} className="text-sm font-medium text-text-primary">
      {children}
    </label>
    {required ? (
      <span className="text-tooltip font-normal text-text-muted">{ADMIN_UI.requiredForPublish}</span>
    ) : null}
  </span>
);
