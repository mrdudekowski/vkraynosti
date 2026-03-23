import { createContext } from 'react';
import type { ModalState, TeamMember } from '../types';

export interface ModalContextValue {
  modal: ModalState;
  openTeamModal: (member: TeamMember) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);
