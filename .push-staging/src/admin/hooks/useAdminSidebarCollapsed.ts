import { useState } from 'react';
import { ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY } from '../../constants/adminUiTokens';

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(collapsed: boolean): void {
  try {
    window.localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
  } catch {
    /* quota / private mode */
  }
}

export function useAdminSidebarCollapsed(): {
  collapsed: boolean;
  toggle: () => void;
} {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = () => {
    setCollapsed((current) => {
      const next = !current;
      writeCollapsed(next);
      return next;
    });
  };

  return { collapsed, toggle };
}
