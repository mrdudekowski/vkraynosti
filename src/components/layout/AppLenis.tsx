import { useMemo, type ReactNode } from 'react';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { getLenisRootOptions } from '../../constants/smoothScroll';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

type AppLenisProps = {
  children: ReactNode;
};

const AppLenis = ({ children }: AppLenisProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const options = useMemo(() => getLenisRootOptions(), []);

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
