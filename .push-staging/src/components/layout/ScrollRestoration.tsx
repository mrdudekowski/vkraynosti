import { useScrollRestoration } from '../../hooks/useScrollRestoration';

/** Подключает save/restore scroll в sessionStorage (см. `useScrollRestoration`). */
const ScrollRestoration = () => {
  useScrollRestoration();
  return null;
};

export default ScrollRestoration;
