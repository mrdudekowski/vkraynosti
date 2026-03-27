import type { TextareaHTMLAttributes } from 'react';

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  className?: string;
  hasError?: boolean;
};

const TextArea = ({ className = '', hasError, ...props }: TextAreaProps) => (
  <textarea
    className={`w-full min-h-28 rounded-card border bg-white px-4 py-3 text-sm text-text-primary transition-colors duration-hover
      placeholder:text-text-muted/70
      focus:outline-none focus:ring-2 focus:ring-brand-primary/30
      ${hasError ? 'border-difficulty-hard-fg' : 'border-divider'}
      ${className}`}
    {...props}
  />
);

export default TextArea;
