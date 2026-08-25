import { useEffect, useRef } from 'react';
import { ADMIN_AUTOSAVE_DELAY_MS } from '../../constants/adminUiTokens';

type UseAdminAutosaveOptions = {
  enabled: boolean;
  snapshot: string;
  save: () => Promise<void> | void;
};

export function useAdminAutosave({ enabled, snapshot, save }: UseAdminAutosaveOptions): void {
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const timer = window.setTimeout(() => {
      void saveRef.current();
    }, ADMIN_AUTOSAVE_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [enabled, snapshot]);
}
