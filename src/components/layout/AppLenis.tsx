import { useMemo, type ReactNode } from 'react';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { BREAKPOINT_MD_PX, getLenisRootOptions } from '../../constants/smoothScroll';
import { useMatchMinWidth } from '../../hooks/useMatchMinWidth';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

type AppLenisProps = {
  children: ReactNode;
};

const AppLenis = ({ children }: AppLenisProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMatchMinWidth(BREAKPOINT_MD_PX);
  const options = useMemo(() => getLenisRootOptions(isDesktop), [isDesktop]);

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
};

export default AppLenis;
