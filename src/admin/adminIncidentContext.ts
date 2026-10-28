import { createContext, useContext } from 'react';
import type { AdminCmsHealth } from './api';
import type { AdminIncident } from './resolveAdminIncident';

export type AdminIncidentContextValue = {
  incident: AdminIncident | null;
  catalogMirror: AdminCmsHealth['catalogMirror'];
};

export const AdminIncidentContext = createContext<AdminIncidentContextValue>({
  incident: null,
  catalogMirror: undefined,
});

export function useAdminIncident(): AdminIncidentContextValue {
  return useContext(AdminIncidentContext);
}

export function adminIncidentBlocksMedia(incident: AdminIncident | null): boolean {
  return incident != null;
}
