import { type ReactNode } from 'react';

interface HomeGateBannerShellProps {
  children: ReactNode;
}

/**
 * Оболочка баннера у ворот: контейнер без анимаций при монтировании.
 */
export function HomeGateBannerShell({ children }: HomeGateBannerShellProps) {
  return (
    <div data-home-gate-banner-shell className="overflow-hidden opacity-100">
      {children}
    </div>
  );
}
