import { createContext } from 'react';
import type { ModalState, TourRequestModalPayload } from '../types';

export interface ModalContextValue {
  modal: ModalState;
  openTourRequestModal: (payload: TourRequestModalPayload) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);
