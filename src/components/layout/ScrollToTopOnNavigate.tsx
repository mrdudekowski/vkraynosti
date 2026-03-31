import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import { ROUTES } from '../../constants/routes';
import { scrollWindowToTopImmediate, scrollWindowToTopSmooth } from '../../constants/smoothScroll';

const routeSignature = (pathname: string, search: string, hash: string) =>
  `${pathname}${search}${hash}`;

/**
 * При первой загрузке/перезагрузке — мгновенно вверх, кроме главной с #якорем (секции в Home).
 * После смены маршрута плавно поднимает окно к верху.
 * Не срабатывает при переходе на главную с якорем (скролл к секции — в Home).
 */
const ScrollToTopOnNavigate = () => {
  const location = useLocation();
  const lenis = useLenis();
  const prevSignatureRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const signature = routeSignature(location.pathname, location.search, location.hash);

    if (prevSignatureRef.current === null) {
      prevSignatureRef.current = signature;
      const isHomeWithSectionHash =
        location.pathname === ROUTES.HOME && location.hash.length > 1;
      if (!isHomeWithSectionHash) {
        scrollWindowToTopImmediate(lenis);
      }
      return;
    }
    if (prevSignatureRef.current === signature) return;
    prevSignatureRef.current = signature;

    const isHomeWithSectionHash =
      location.pathname === ROUTES.HOME && location.hash.length > 1;
    if (isHomeWithSectionHash) return;

    scrollWindowToTopSmooth(lenis);
  }, [location, lenis]);

  return null;
};

export default ScrollToTopOnNavigate;
