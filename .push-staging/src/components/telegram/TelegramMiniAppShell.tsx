import { useEffect, type ReactNode } from 'react';
import type { Season } from '../../types';
import { initTelegramWebApp } from '../../lib/telegram/telegramWebApp';

interface TelegramMiniAppShellProps {
  season?: Season;
  children: ReactNode;
  className?: string;
}

const TelegramMiniAppShell = ({
  season,
  children,
  className = '',
}: TelegramMiniAppShellProps) => {
  useEffect(() => {
    initTelegramWebApp();
    const root = document.getElementById('root');
    if (root?.querySelector('main')) {
      root.replaceChildren();
    }
  }, []);

  return (
    <div
      className={`min-h-dvh bg-surface-light text-text-primary ${className}`.trim()}
      {...(season != null ? { 'data-season': season } : {})}
    >
      {children}
    </div>
  );
};

export default TelegramMiniAppShell;
