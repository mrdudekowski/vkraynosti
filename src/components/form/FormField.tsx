import type { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  /** Подсказка под контролом (как строка ошибки), а не над полем. */
  hintBelow?: boolean;
  error?: string;
  children: ReactNode;
}

/**
 * Обёртка поля: подпись, подсказка, контрол и сообщение об ошибке.
 */
const FormField = ({ id, label, hint, hintBelow, error, children }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium text-text-primary">
      {label}
    </label>
    {hint && !hintBelow ? (
      <span id={`${id}-hint`} className="text-tooltip text-text-muted">
        {hint}
      </span>
    ) : null}
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="text-tooltip text-difficulty-hard-fg">
        {error}
      </p>
    ) : hint && hintBelow ? (
      <p id={`${id}-hint`} className="text-tooltip text-text-muted">
        {hint}
      </p>
    ) : null}
  </div>
);

export default FormField;
