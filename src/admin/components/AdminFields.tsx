import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

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
