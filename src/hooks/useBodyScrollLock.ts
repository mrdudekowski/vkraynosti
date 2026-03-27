import { useEffect } from 'react';

/**
 * Блокирует прокрутку документа, пока открыта модалка (как у мобильного меню).
 */
export const useBodyScrollLock = (locked: boolean): void => {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
};
