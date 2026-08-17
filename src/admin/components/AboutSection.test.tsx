import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CmsTourDocument } from '../../cms/cmsTourDocument';
import { ADMIN_UI } from '../constants/ui';
import AboutSection from './AboutSection';

const prefaceUrl = 'https://cdn.example/preface.webp';

const document: CmsTourDocument = {
  id: 'winter-1',
  slug: 'izubrinaya',
  season: 'winter',
  status: 'active',
  title: 'Изюбриная',
  subtitle: 'Зима',
  heroPhrase: 'Ели',
  description: 'Текст',
  duration: '1 день',
  difficulty: 'Medium',
  price: 'по запросу',
  program: [],
  included: [],
  coverAssetId: null,
  prefaceAssetId: 'preface',
  assets: [
    {
      id: 'preface',
      stillUrl: prefaceUrl,
      videoUrl: null,
      alt: 'Фон',
    },
  ],
  bento: { blocks: [] },
  legacyGalleryVariant: null,
};

describe('AboutSection', () => {
  it('рисует фон блока картинкой на всю карточку, а не полосой над скримом', () => {
    render(
      <AboutSection
        document={document}
        description=""
        descriptionLeadBold=""
        descriptionAside=""
        coverAssetId={null}
        prefaceAssetId="preface"
        uploading={false}
        onDescription={vi.fn()}
        onLead={vi.fn()}
        onAside={vi.fn()}
        onCoverFiles={vi.fn()}
        onPrefaceFiles={vi.fn()}
        coverCrop={{}}
        onCoverCrop={vi.fn()}
      />,
    );

    const prefaceImg = screen.getByAltText('', { selector: `img[src="${prefaceUrl}"]` });
    expect(prefaceImg).toHaveAttribute('src', prefaceUrl);
    expect(prefaceImg).toHaveClass('object-cover');
    expect(prefaceImg.parentElement).toHaveClass('h-48');
    expect(screen.getByText(ADMIN_UI.changePhoto)).toBeInTheDocument();
  });
});
