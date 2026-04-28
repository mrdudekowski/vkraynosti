import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import { ROUTES } from '../../constants/routes';
import {
  NAVBAR_SCROLL_OFFSET_PX,
  scrollElementIntoViewAnchored,
  scrollWindowToTopImmediate,
  scrollWindowToTopSmooth,
} from '../../constants/smoothScroll';

const routeSignature = (pathname: string, search: string, hash: string) =>
  `${pathname}${search}${hash}`;

/**
 * Первый монтинг (в т.ч. F5): всегда мгновенно вверх — без якорного скролла по URL.
 * Дальше: смена маршрута — плавно вверх; переход на главную с `#hash` или смена только hash — к секции.
 */
const ScrollToTopOnNavigate = () => {
  const location = useLocation();
  const lenis = useLenis();
  const prevSignatureRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const signature = routeSignature(location.pathname, location.search, location.hash);
    const isHomeWithSectionHash = location.pathname === ROUTES.HOME && location.hash.length > 1;

    if (prevSignatureRef.current === null) {
      prevSignatureRef.current = signature;
      scrollWindowToTopImmediate(lenis);
      return;
    }

    if (prevSignatureRef.current === signature) {
      return;
    }

    const previousSignature = prevSignatureRef.current;
    prevSignatureRef.current = signature;

    if (isHomeWithSectionHash && previousSignature !== signature) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        scrollElementIntoViewAnchored(lenis, el, NAVBAR_SCROLL_OFFSET_PX);
      }
      return;
    }

    scrollWindowToTopSmooth(lenis);
  }, [location, lenis]);

  return null;
};

export default ScrollToTopOnNavigate;
