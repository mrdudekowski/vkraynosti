import { IMAGES } from '../../constants/images';
import { UI } from '../../constants/ui';
import { useSeason } from '../../context/useSeason';
import RevealBox from '../shared/RevealBox';
import ScrollScrubFade from '../shared/ScrollScrubFade';
import TourCalendar from './TourCalendar';

const TourCalendarSection = () => {
  const { activeSeason } = useSeason();
  const sectionBackground = IMAGES.seasonSection[activeSeason];

  return (
    <section
      id={UI.sections.homeTourCalendarSectionElementId}
      className="relative isolate overflow-hidden py-section-y"
    >
      <img
        src={sectionBackground}
        alt=""
        className="absolute inset-0 z-0 size-full object-cover"
        width={1920}
        height={1080}
        decoding="async"
        loading="lazy"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-stack-base bg-gradient-to-b from-surface-dark/75 via-surface-dark/55 to-surface-dark/80"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center lg:mb-12">
          <ScrollScrubFade as="h2" className="section-title text-text-inverse">
            {UI.sections.tourCalendarTitle}
          </ScrollScrubFade>
          <RevealBox as="div" className="mx-auto mt-3 max-w-2xl text-text-inverse/85">
            <p>{UI.sections.tourCalendarLead}</p>
          </RevealBox>
        </div>

        <RevealBox as="div">
          <TourCalendar />
        </RevealBox>
      </div>
    </section>
  );
};

export default TourCalendarSection;
