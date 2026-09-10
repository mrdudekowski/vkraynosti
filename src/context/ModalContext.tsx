import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { ModalState, TourRequestModalPayload } from '../types';
import { ModalContext } from './modal-context-definition';
import { useSiteContent } from './SiteContentContext';

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const { modal: modalConfig } = useSiteContent();
  const [modal, setModal] = useState<ModalState>({ type: null });
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const captureFocusAndOpen = useCallback((next: ModalState) => {
    const active = document.activeElement;
    lastFocusRef.current = active instanceof HTMLElement ? active : null;
    setModal(next);
  }, []);

  const openTourRequestModal = useCallback(
    (payload: TourRequestModalPayload) => {
      captureFocusAndOpen(modalConfig.requestFormEnabled ? { type: 'tourRequest', payload } : { type: 'contact', payload: { title: payload.title } });
    },
    [captureFocusAndOpen, modalConfig.requestFormEnabled]
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
