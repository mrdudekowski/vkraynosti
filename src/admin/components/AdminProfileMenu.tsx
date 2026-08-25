import { ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { AdminSession } from '../api';
import { ADMIN_UI } from '../constants/ui';
import AdminIcon from './AdminIcon';

export default function AdminProfileMenu({ session, onLogout }: { session: AdminSession; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, [open]);
  const role = session.role === 'admin' ? ADMIN_UI.scheduleAccountRoleAdmin : ADMIN_UI.scheduleAccountRoleEditor;
  return <div ref={ref} className="relative w-full">
    <button type="button" className="flex min-h-11 w-full items-center gap-2 rounded-admin-control px-2 py-1.5 text-left transition-colors hover:bg-text-inverse/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-inverse/50" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-dark text-xs font-semibold text-text-primary">{session.login.slice(0, 1).toUpperCase()}</span>
      <span className="min-w-0 flex-1 text-tooltip"><span className="block truncate font-medium text-text-inverse">{session.login}</span><span className="block truncate text-text-inverse/60">{role}</span></span>
      <AdminIcon icon={ChevronDown} size={16} className="shrink-0 text-text-inverse/60" />
    </button>
    {open ? <div role="menu" className="absolute bottom-full left-0 z-tooltip mb-2 w-full min-w-60 rounded-admin-control border border-divider bg-surface-light p-2 shadow-admin-overlay">
      <p className="px-2 py-1 text-xs text-text-muted">{role}</p>
      <p className="px-2 py-1 text-sm text-text-primary">{session.canPublishTours ? 'Публикация туров разрешена' : 'Только черновики туров'}</p>
      <p className="px-2 py-1 text-sm text-text-primary">{session.canPublishSchedule ? 'Публикация выездов разрешена' : 'Только черновики выездов'}</p>
      <button type="button" role="menuitem" className="admin-btn-ghost mt-1 w-full justify-start gap-2" onClick={onLogout}><AdminIcon icon={LogOut} size={16} />{ADMIN_UI.logout}</button>
    </div> : null}
  </div>;
}
