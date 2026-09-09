import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import type { AdminNavItem } from '../constants/nav';
import { ADMIN_UI } from '../constants/ui';
import AdminIcon from './AdminIcon';

type AdminCommandMenuProps = {
  items: readonly AdminNavItem[];
  onClose: () => void;
};

const AdminCommandMenu = ({ items, onClose }: AdminCommandMenuProps) => {
  const [query, setQuery] = useState('');
  const shellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useModalFocusTrap(shellRef, onClose);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = items.filter((item) =>
    item.label.toLocaleLowerCase('ru-RU').includes(query.trim().toLocaleLowerCase('ru-RU')),
  );

  return (
    <div className="fixed inset-0 z-modal flex items-start justify-center bg-surface-dark/40 px-4 pt-[12vh]">
      <button type="button" className="absolute inset-0" aria-label={ADMIN_UI.closeOverlay} onClick={onClose} />
      <div
        ref={shellRef}
        role="dialog"
        aria-modal="true"
        aria-label={ADMIN_UI.commandMenu}
        className="relative z-modal w-full max-w-lg rounded-admin-surface border border-divider bg-surface-light p-3 shadow-admin-overlay"
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.commandSearch}</span>
          <input
            ref={inputRef}
            className="admin-input"
            type="search"
            role="searchbox"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {filtered.length === 0 ? (
          <p className="p-3 text-sm text-text-muted">{ADMIN_UI.commandEmpty}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1" role="listbox">
            {filtered.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  className="flex min-h-11 items-center gap-2 rounded-admin-control px-2 text-sm no-underline hover:bg-surface-dark/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                  onClick={onClose}
                >
                  <AdminIcon icon={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminCommandMenu;
