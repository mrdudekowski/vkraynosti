import { useNavigate } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import { ROUTES } from '../../constants/routes';
import type { Season } from '../../types';
import { useSeason } from '../../context/useSeason';
import { scrollWindowToTopSmooth } from '../../constants/smoothScroll';
import SeasonIconButtons from './SeasonIconButtons';

type SeasonSwitcherVariant = 'navbar' | 'section';

interface SeasonSwitcherProps {
  variant?: SeasonSwitcherVariant;
  className?: string;
}

const SeasonSwitcher = ({ variant = 'section', className }: SeasonSwitcherProps) => {
  const { activeSeason, setActiveSeason } = useSeason();
  const lenis = useLenis();
  const navigate = useNavigate();

  const handleSeasonChange = (season: Season) => {
    setActiveSeason(season);
    void navigate(ROUTES.HOME);
    scrollWindowToTopSmooth(lenis);
  };

  return (
    <SeasonIconButtons
      activeSeason={activeSeason}
      onSeasonChange={handleSeasonChange}
      variant={variant}
      className={className}
    />
  );
};

export default SeasonSwitcher;
