import { createContext } from 'react';
import type { ModalState, TeamMember, TourRequestModalPayload } from '../types';

export interface ModalContextValue {
  modal: ModalState;
  openTeamModal: (member: TeamMember) => void;
  openTourRequestModal: (payload: TourRequestModalPayload) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);
