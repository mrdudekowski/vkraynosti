import { createContext, useContext } from 'react';
import type { AdminStorageState } from './api';

export type AdminStorageContextValue = {
  storage: AdminStorageState;
};

export const AdminStorageContext = createContext<AdminStorageContextValue>({ storage: 'closed' });

export function useAdminStorage(): AdminStorageContextValue {
  return useContext(AdminStorageContext);
}
