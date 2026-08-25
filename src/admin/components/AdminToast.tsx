import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ADMIN_TOAST_DURATION_MS } from '../../constants/adminUiTokens';
import { ADMIN_UI } from '../constants/ui';
import { AdminToastContext, type AdminToastInput } from '../toast/adminToastContext';
import AdminButton from './AdminButton';

type AdminToast = AdminToastInput & { id: number };

type AdminToastProviderProps = {
  children: ReactNode;
};

export const AdminToastProvider = ({ children }: AdminToastProviderProps) => {
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const nextId = useRef(1);
  const timers = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer != null) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (toast: AdminToastInput) => {
      const id = nextId.current;
      nextId.current += 1;
      setToasts((current) => [...current, { ...toast, id }]);
      const timer = window.setTimeout(() => {
        dismiss(id);
      }, ADMIN_TOAST_DURATION_MS);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className="admin-toast-stack">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto rounded-admin-control border border-divider bg-surface-light px-3 py-2 shadow-admin-overlay"
          >
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 text-sm text-text-primary">{toast.message}</p>
              {toast.onAction != null && toast.actionLabel != null ? (
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    toast.onAction?.();
                    dismiss(toast.id);
                  }}
                >
                  {toast.actionLabel}
                </AdminButton>
              ) : null}
              <AdminButton type="button" variant="ghost" onClick={() => dismiss(toast.id)}>
                {ADMIN_UI.toastDismiss}
              </AdminButton>
            </div>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
};
