import { VKRAI_FOREST_LOGO } from '../../constants/images';
import {
  HOME_TEAM_CONTACT_BRIDGE_DIVIDER_CLASS,
  HOME_TEAM_CONTACT_BRIDGE_INNER_CLASS,
  HOME_TEAM_CONTACT_BRIDGE_MARK_CLASS,
  HOME_TEAM_CONTACT_BRIDGE_MARK_WRAPPER_CLASS,
  HOME_TEAM_CONTACT_BRIDGE_SECTION_CLASS,
} from '../../constants/homeTeamContactBridge';
import { TEAM_SECTION_DIVIDER_CLASS } from '../../constants/seasonTheme';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useSeason } from '../../context/useSeason';
import RevealBox from '../shared/RevealBox';

const HomeTeamContactBrandBridge = () => {
  const { activeSeason } = useSeason();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      role="presentation"
      data-home-team-contact-bridge
      className={HOME_TEAM_CONTACT_BRIDGE_SECTION_CLASS}
    >
      <div className={HOME_TEAM_CONTACT_BRIDGE_INNER_CLASS}>
        <RevealBox
          as="div"
          once
          disabled={prefersReducedMotion}
          className="flex w-full justify-center"
        >
          <div className={HOME_TEAM_CONTACT_BRIDGE_MARK_WRAPPER_CLASS}>
            <img
              src={VKRAI_FOREST_LOGO}
              alt=""
              className={HOME_TEAM_CONTACT_BRIDGE_MARK_CLASS}
              decoding="async"
              loading="lazy"
              draggable={false}
              aria-hidden
            />
          </div>
        </RevealBox>
        <div
          className={[
            HOME_TEAM_CONTACT_BRIDGE_DIVIDER_CLASS,
            TEAM_SECTION_DIVIDER_CLASS[activeSeason],
          ].join(' ')}
          aria-hidden
        />
      </div>
    </div>
  );
};

export default HomeTeamContactBrandBridge;
