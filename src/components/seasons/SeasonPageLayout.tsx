import type { ReactNode } from 'react';
import { ROUTES } from '../../constants/routes';
import { UI } from '../../constants/ui';
import { IMAGES } from '../../constants/images';
import Breadcrumbs from '../shared/Breadcrumbs';
import PageMeta from '../shared/PageMeta';
import type { Season } from '../../types';
import { SEASON_PAGE_BG_CLASS } from '../../constants/seasonTheme';

interface SeasonPageLayoutProps {
  seasonKey: Season;
  metaTitle: string;
  metaDescription: string;
  metaPath: string;
  children: ReactNode;
}

const SeasonPageLayout = ({
  seasonKey,
  metaTitle,
  metaDescription,
  metaPath,
  children,
}: SeasonPageLayoutProps) => {
  const season = UI.seasons[seasonKey];
  const heroImageUrl = IMAGES.hero[seasonKey];

  return (
    <div className={`min-h-screen ${SEASON_PAGE_BG_CLASS[seasonKey]}`}>
      <PageMeta
        title={metaTitle}
        description={metaDescription}
        imageUrl={heroImageUrl}
        path={metaPath}
      />

      <div
        className="h-72 bg-cover bg-center flex items-end"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="w-full bg-gradient-to-t from-black/70 to-transparent px-8 pb-8">
          <p className="text-4xl mb-2">{season.emoji}</p>
          <h1 className="font-display text-section font-bold text-white">{season.label}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Breadcrumbs
          className="mb-8"
          items={[
            { label: UI.breadcrumbs.home, to: ROUTES.HOME },
            { label: `${season.emoji} ${season.label}` },
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SeasonPageLayout;
