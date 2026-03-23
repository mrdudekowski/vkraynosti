import type { ReactNode } from 'react';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import type { UseRevealOnScrollOptions } from '../../hooks/useRevealOnScroll';

interface RevealBoxProps extends UseRevealOnScrollOptions {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section';
  id?: string;
}

/**
 * Обёртка для scroll-reveal: `reveal-base` + видимость по IntersectionObserver.
 * Пока скрыто — `inert`, чтобы фокус не попадал в невидимый интерактив.
 */
const RevealBox = ({
  as: Tag = 'div',
  children,
  className = '',
  id,
  once,
  threshold,
  rootMargin,
  initialVisible,
  disabled,
}: RevealBoxProps) => {
  const { ref, isRevealed, revealClassName } = useRevealOnScroll({
    once,
    threshold,
    rootMargin,
    initialVisible,
    disabled,
  });

  const combined = `reveal-base ${revealClassName} ${className}`.trim();

  return (
    <Tag
      ref={ref}
      id={id}
      className={combined}
      inert={isRevealed ? undefined : true}
    >
      {children}
    </Tag>
  );
};

export default RevealBox;
