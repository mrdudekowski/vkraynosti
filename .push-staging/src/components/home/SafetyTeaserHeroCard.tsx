import { Link } from 'react-router-dom';
import { getTeamHeroTextStaggerPresentation } from '../../constants/teamHeroAnimation';
import { HOME_SAFETY_TEASER_HERO_IMAGE } from '../../constants/images';
import { REVEAL_ROOT_MARGIN, REVEAL_THRESHOLD } from '../../constants/reveal';
import { ROUTES } from '../../constants/routes';
import {
  SAFETY_TEASER_HERO_CARD_CLASS,
  SAFETY_TEASER_HERO_OVERLAY_CLASS,
} from '../../constants/safetyStatusLayout';
import { UI } from '../../constants/ui';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import PlaceholderImage from '../shared/PlaceholderImage';
import TourCardHeightGhost from '../shared/TourCardHeightGhost';

const { safetyTeaserTitle, safety_cta: safetyCta, safetyHeroImageAlt } = UI.sections;

const SafetyTeaserHeroCard = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { ref: cardRevealRef, isRevealed } = useRevealOnScroll({
    once: true,
    disabled: prefersReducedMotion,
    threshold: REVEAL_THRESHOLD,
    rootMargin: REVEAL_ROOT_MARGIN,
  });
  const isTextRevealed = prefersReducedMotion || isRevealed;
  const titleStagger = getTeamHeroTextStaggerPresentation(
    0,
    prefersReducedMotion,
    isTextRevealed
  );
  const ctaStagger = getTeamHeroTextStaggerPresentation(1, prefersReducedMotion, isTextRevealed);

  const ariaLabel = `${safetyTeaserTitle}. ${safetyCta}`;

  return (
    <Link
      ref={cardRevealRef}
      to={ROUTES.SAFETY}
      prefetch="intent"
      aria-label={ariaLabel}
      className={SAFETY_TEASER_HERO_CARD_CLASS}
    >
      <TourCardHeightGhost />
      <div className="absolute inset-0" aria-hidden>
        <PlaceholderImage
          src={HOME_SAFETY_TEASER_HERO_IMAGE}
          alt={safetyHeroImageAlt}
          className="h-full w-full opacity-50"
          imgClassName="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-surface-dark/45" />
      </div>
      <div className={SAFETY_TEASER_HERO_OVERLAY_CLASS}>
        <div className="flex flex-col items-center gap-3 p-card-p">
          <span
            className={[
              'font-heading text-card text-text-inverse',
              titleStagger.className,
            ].join(' ')}
            style={titleStagger.style}
          >
            {safetyTeaserTitle}
          </span>
          <span
            className={[
              'font-body text-sm text-text-inverse/90',
              ctaStagger.className,
            ].join(' ')}
            style={ctaStagger.style}
          >
            {safetyCta}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SafetyTeaserHeroCard;
