import type { ReactNode } from 'react';
import { useScrollScrubFade } from '../../hooks/useScrollScrubFade';

type ScrollScrubFadeRootTag = 'div' | 'section' | 'h1' | 'h2' | 'h3';

type ScrollScrubFadeProps = {
  children: ReactNode;
  className?: string;
  as?: ScrollScrubFadeRootTag;
  id?: string;
};

/**
 * Обёртка секции: opacity и translateY синхронизируются со скроллом (см. useScrollScrubFade).
 * Без CSS transition — значения «привязаны» к позиции во вьюпорте.
 */
const ScrollScrubFade = ({
  as: Tag = 'div',
  children,
  className = '',
  id,
}: ScrollScrubFadeProps) => {
  const { ref } = useScrollScrubFade();
  const combined = `transition-none ${className}`.trim();

  return (
    <Tag ref={ref} id={id} className={combined}>
      {children}
    </Tag>
  );
};

export default ScrollScrubFade;
