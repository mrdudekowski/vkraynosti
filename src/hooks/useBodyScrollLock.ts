import { useEffect } from 'react';
import { useLenis } from 'lenis/react';

/**
 * Блокирует прокрутку страницы под модалкой: `overflow` на `html`/`body` и `lenis.stop()`.
 */
export const useBodyScrollLock = (locked: boolean): void => {
  const lenis = useLenis();

  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const { body } = document;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehaviorY;
    const prevBodyOverscroll = body.style.overscrollBehaviorY;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.overscrollBehaviorY = 'none';
    body.style.overscrollBehaviorY = 'none';

    lenis?.stop();

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehaviorY = prevHtmlOverscroll;
      body.style.overscrollBehaviorY = prevBodyOverscroll;
      lenis?.start();
    };
  }, [locked, lenis]);
};
