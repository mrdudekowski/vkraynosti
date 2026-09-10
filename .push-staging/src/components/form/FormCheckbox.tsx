import type { InputHTMLAttributes } from 'react';

export type FormCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string;
};

/**
 * Стилизованный SVG-чекбокс (анимация stroke-dash). Размер визуала 16×16 (`h-4 w-4`), как у нативного в формах.
 */
const FormCheckbox = ({ id, className = '', ...rest }: FormCheckboxProps) => {
  return (
    <div className={`relative inline-flex shrink-0 ${className}`.trim()}>
      <input id={id} type="checkbox" className="peer sr-only focus-visible:outline-none" {...rest} />
      <label
        htmlFor={id}
        className="form-checkbox-visual text-text-muted transition-colors duration-hover hover:text-brand-primary peer-checked:text-brand-primary peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary/30 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white rounded-sm"
      >
        <svg
          className="form-checkbox-svg pointer-events-none h-4 w-4"
          viewBox="0 0 18 18"
          aria-hidden
        >
          <path d="M 1 9 L 1 9 c 0 -5 3 -8 8 -8 L 9 1 C 14 1 17 5 17 9 L 17 9 c 0 4 -4 8 -8 8 L 9 17 C 5 17 1 14 1 9 L 1 9 Z" />
          <polyline points="1 9 7 14 15 4" />
        </svg>
      </label>
    </div>
  );
};

export default FormCheckbox;
