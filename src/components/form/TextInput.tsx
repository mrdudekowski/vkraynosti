import type { InputHTMLAttributes } from 'react';

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  className?: string;
  hasError?: boolean;
};

const TextInput = ({ className = '', hasError, ...props }: TextInputProps) => (
  <input
    className={`w-full rounded-card border bg-white px-4 py-3 text-sm text-text-primary transition-colors duration-hover
      placeholder:text-text-muted/70
      focus:outline-none focus:ring-2 focus:ring-brand-primary/30
      ${hasError ? 'border-difficulty-hard-fg' : 'border-divider'}
      ${className}`}
    {...props}
  />
);

export default TextInput;
