import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildHomeSectionPath } from '../constants/routes';
import { UI } from '../constants/ui';

type BrowserBackOverrideOptions = {
  enabled: boolean;
};

/**
 * Пока пользователь на странице тура: системная кнопка Back возвращает на главную к секции «Туры».
 * Делает это через навигацию на `/#tours`, чтобы сработал существующий `ScrollToTopOnNavigate`.
 */
export const useBrowserBackToHomeTours = ({ enabled }: BrowserBackOverrideOptions) => {
  const navigate = useNavigate();
  const homeToursPath = useMemo(
    () => buildHomeSectionPath(UI.sections.homeToursSectionElementId),
    []
  );

  useEffect(() => {
    if (!enabled) return;

    const handlePopState = () => {
      navigate(homeToursPath, { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [enabled, homeToursPath, navigate]);
};

