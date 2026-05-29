import type { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  /** Обязательное поле — красная звёздочка рядом с подписью (токен `text-difficulty-hard-fg`). */
  required?: boolean;
  /** Доп. контрол справа от подписи в одной строке. */
  labelAside?: ReactNode;
  hint?: string;
  /** Подсказка под контролом (как строка ошибки), а не над полем. */
  hintBelow?: boolean;
  error?: string;
  children: ReactNode;
}

/**
 * Обёртка поля: подпись, подсказка, контрол и сообщение об ошибке (ошибка — только для скринридеров).
 */
const FormField = ({
  id,
  label,
  required,
  labelAside,
  hint,
  hintBelow,
  error,
  children,
}: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    {labelAside ? (
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
          {required ? (
            <span className="text-difficulty-hard-fg" aria-hidden>
              {' '}
              *
            </span>
          ) : null}
        </label>
        {labelAside}
      </div>
    ) : (
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
        {required ? (
          <span className="text-difficulty-hard-fg" aria-hidden>
            {' '}
            *
          </span>
        ) : null}
      </label>
    )}
    {hint && !hintBelow ? (
      <span id={`${id}-hint`} className="text-tooltip text-text-muted">
        {hint}
      </span>
    ) : null}
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="sr-only text-tooltip">
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
