import { render, screen, within } from '@testing-library/react';
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
        heroPhrase=""
        onHeroPhrase={vi.fn()}
      />,
    );

    const prefaceImg = screen.getByAltText('');
    expect(prefaceImg).toHaveAttribute('src', prefaceUrl);
    expect(prefaceImg).toHaveClass('object-cover');
    expect(prefaceImg.parentElement).toHaveClass('h-36');
    expect(screen.getByText(ADMIN_UI.changeBackground)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.addPhoto)).toBeInTheDocument();
  });

  it('ставит описание в две колонки, как на сайте', () => {
    render(
      <AboutSection
        document={document}
        description="левая"
        descriptionLeadBold="лид"
        descriptionAside="правая"
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
        heroPhrase=""
        onHeroPhrase={vi.fn()}
      />,
    );

    expect(screen.getByText(ADMIN_UI.aboutCoverHeading)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.aboutTextHeading)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.aboutColumnsHint)).toBeInTheDocument();
    expect(screen.getByTestId('admin-about-columns')).toHaveClass('md:grid-cols-2');
    expect(screen.getByLabelText(ADMIN_UI.descriptionLabel)).toHaveValue('левая');
    expect(screen.getByLabelText(ADMIN_UI.asideLabel)).toHaveValue('правая');

    const coverHeading = screen.getByRole('heading', { name: ADMIN_UI.aboutCoverHeading });
    const coverSection = coverHeading.closest('section');
    expect(coverSection).not.toBeNull();
    expect(within(coverSection as HTMLElement).queryByText(ADMIN_UI.coverLabel)).not.toBeInTheDocument();
    expect(within(coverSection as HTMLElement).getByLabelText(ADMIN_UI.heroPhraseLabel)).toBeInTheDocument();
  });

  it('с обложкой показывает вкладки кадров, а не все превью сразу', () => {
    const withCover: CmsTourDocument = {
      ...document,
      coverAssetId: 'cover',
      assets: [
        ...document.assets,
        {
          id: 'cover',
          stillUrl: 'https://cdn.example/cover.webp',
          videoUrl: null,
          alt: 'Обложка',
        },
      ],
    };

    render(
      <AboutSection
        document={withCover}
        description="левая"
        descriptionLeadBold="лид"
        descriptionAside="правая"
        coverAssetId="cover"
        prefaceAssetId="preface"
        uploading={false}
        onDescription={vi.fn()}
        onLead={vi.fn()}
        onAside={vi.fn()}
        onCoverFiles={vi.fn()}
        onPrefaceFiles={vi.fn()}
        coverCrop={{}}
        onCoverCrop={vi.fn()}
        heroPhrase=""
        onHeroPhrase={vi.fn()}
      />,
    );

    expect(screen.getByRole('tablist', { name: ADMIN_UI.coverCropHeading })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: ADMIN_UI.coverCropCard })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByText(ADMIN_UI.coverCropHint)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.changePhoto)).toBeInTheDocument();
    expect(screen.getByLabelText(ADMIN_UI.heroPhraseLabel)).toBeInTheDocument();
  });
});
