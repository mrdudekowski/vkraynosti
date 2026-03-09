import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ModalState, TeamMember } from '../types';

interface ModalContextValue {
  modal: ModalState;
  openTeamModal:    (member: TeamMember) => void;
  openConsultModal: () => void;
  closeModal:       () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ModalState>({ type: null });

  const openTeamModal    = (member: TeamMember) => setModal({ type: 'teamMember', payload: member });
  const openConsultModal = () => setModal({ type: 'tourConsult' });
  const closeModal       = () => setModal({ type: null });

  return (
    <ModalContext.Provider value={{ modal, openTeamModal, openConsultModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextValue => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};
