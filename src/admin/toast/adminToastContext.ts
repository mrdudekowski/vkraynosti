import { createContext, useContext } from 'react';

export type AdminToastInput = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export type AdminToastContextValue = {
  push: (toast: AdminToastInput) => void;
};

export const AdminToastContext = createContext<AdminToastContextValue | null>(null);

export function useAdminToast(): AdminToastContextValue {
  const value = useContext(AdminToastContext);
  if (value == null) {
    throw new Error('useAdminToast requires AdminToastProvider');
  }
  return value;
}
