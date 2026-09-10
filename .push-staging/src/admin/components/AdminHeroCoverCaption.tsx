import { HeroCarouselCaption } from '../../components/home/HeroCarouselCaption';
import {
  TOUR_COVER_HERO_LG_STAGE_WIDTH_PX,
  TOUR_COVER_HERO_PHONE_STAGE_WIDTH_PX,
  tourCoverHeroStageHeightPx,
} from '../../constants/tourCoverCropPreview';

type AdminHeroCoverCaptionProps = {
  phrase: string;
  gutter: 'phone' | 'lg';
};

const AdminHeroCoverCaption = ({ phrase, gutter }: AdminHeroCoverCaptionProps) => {
  const widthPx =
    gutter === 'phone' ? TOUR_COVER_HERO_PHONE_STAGE_WIDTH_PX : TOUR_COVER_HERO_LG_STAGE_WIDTH_PX;
  const heightPx = tourCoverHeroStageHeightPx(widthPx, gutter);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ containerType: 'inline-size' }}
    >
      <div
        className="absolute bottom-0 left-1/2"
        style={{
          width: widthPx,
          height: heightPx,
          marginLeft: -widthPx / 2,
          transform: `scale(calc(100cqw / ${widthPx}px))`,
          transformOrigin: 'bottom center',
        }}
      >
        <HeroCarouselCaption phrase={phrase} gutter={gutter} />
      </div>
    </div>
  );
};

export default AdminHeroCoverCaption;
