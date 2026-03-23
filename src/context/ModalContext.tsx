import {
  useCallback,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { ModalState, TeamMember } from '../types';
import { ModalContext } from './modal-context-definition';

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ModalState>({ type: null });
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const openTeamModal = useCallback((member: TeamMember) => {
    const active = document.activeElement;
    lastFocusRef.current = active instanceof HTMLElement ? active : null;
    setModal({ type: 'teamMember', payload: member });
  }, []);

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

  return (
    <ModalContext.Provider value={{ modal, openTeamModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
