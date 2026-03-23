import { useContext } from 'react';
import { ModalContext, type ModalContextValue } from './modal-context-definition';

export const useModal = (): ModalContextValue => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};
