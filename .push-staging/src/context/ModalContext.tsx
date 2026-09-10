import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { ModalState, TourRequestModalPayload } from '../types';
import { ModalContext } from './modal-context-definition';

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ModalState>({ type: null });
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const captureFocusAndOpen = useCallback((next: ModalState) => {
    const active = document.activeElement;
    lastFocusRef.current = active instanceof HTMLElement ? active : null;
    setModal(next);
  }, []);

  const openTourRequestModal = useCallback(
    (payload: TourRequestModalPayload) => {
      captureFocusAndOpen({ type: 'tourRequest', payload });
    },
    [captureFocusAndOpen]
  );

  const closeModal = useCallback(() => {
    const toRestore = lastFocusRef.current;
    lastFocusRef.current = null;
    setModal({ type: null });
    queueMicrotask(() => {
      if (toRestore && document.contains(toRestore)) {
        toRestore.focus();
      }
    });
  }, []);

  const modalContextValue = useMemo(
    () => ({ modal, openTourRequestModal, closeModal }),
    [modal, openTourRequestModal, closeModal]
  );

  return (
    <ModalContext.Provider value={modalContextValue}>
      {children}
    </ModalContext.Provider>
  );
};
