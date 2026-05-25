import {
  SAFETY_SECTION_GRID_CLASS,
  SAFETY_SECTION_HERO_COLUMN_CLASS,
  SAFETY_SECTION_STACK_COLUMN_CLASS,
} from '../../constants/safetyStatusLayout';
import RevealBox from '../shared/RevealBox';
import SafetyStatusStack from './SafetyStatusStack';
import SafetyTeaserHeroCard from './SafetyTeaserHeroCard';

const SafetySection = () => {
  return (
    <section
      id="safety"
      className="relative isolate overflow-hidden pt-section-y pb-home-section-top text-text-primary"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={SAFETY_SECTION_GRID_CLASS}>
          <RevealBox as="div" className={SAFETY_SECTION_STACK_COLUMN_CLASS}>
            <SafetyStatusStack />
          </RevealBox>

          <div className={SAFETY_SECTION_HERO_COLUMN_CLASS}>
            <SafetyTeaserHeroCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetySection;
