import { type ReactNode } from 'react';

interface HomeGateBannerShellProps {
  children: ReactNode;
}

/**
 * Оболочка баннера у ворот: контейнер; само содержимое — статичный `HomeSeasonBanner` (см. UI).
 */
export function HomeGateBannerShell({ children }: HomeGateBannerShellProps) {
  return (
    <div
      data-home-gate-banner-shell
      className="w-full max-w-home-gate-banner-shell overflow-hidden opacity-100"
    >
      {children}
    </div>
  );
}
