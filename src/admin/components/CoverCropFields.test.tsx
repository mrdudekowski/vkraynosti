import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CmsTourAsset } from '../../cms/cmsTourDocument';
import { UI } from '../../constants/ui';
import { ADMIN_UI } from '../constants/ui';
import CoverCropFields from './CoverCropFields';

const coverAsset: CmsTourAsset = {
  id: 'cover',
  stillUrl: 'https://cdn.example/cover.webp',
  videoUrl: null,
  alt: 'Обложка',
};

describe('CoverCropFields', () => {
  it('без фото показывает загрузку, без вкладок', () => {
    render(
      <CoverCropFields
        asset={undefined}
        crop={{}}
        onChange={vi.fn()}
        uploading={false}
        onFiles={vi.fn()}
        inputId="admin-cover"
        missing
        heroPhrase=""
        onHeroPhrase={vi.fn()}
      />,
    );

    expect(screen.getByText(ADMIN_UI.addPhoto)).toBeInTheDocument();
    expect(screen.queryByRole('tablist', { name: ADMIN_UI.coverCropHeading })).not.toBeInTheDocument();
  });

  it('вкладки идут по шагам и показывают один кадр', async () => {
    const user = userEvent.setup();
    render(
      <CoverCropFields
        asset={coverAsset}
        crop={{}}
        onChange={vi.fn()}
        uploading={false}
        onFiles={vi.fn()}
        inputId="admin-cover"
        heroPhrase="Сопки уходят в море"
        onHeroPhrase={vi.fn()}
      />,
    );

    const cardTab = screen.getByRole('tab', { name: ADMIN_UI.coverCropCard });
    const heroTab = screen.getByRole('tab', { name: ADMIN_UI.coverCropHero });
    const heroLgTab = screen.getByRole('tab', { name: ADMIN_UI.coverCropHeroLg });

    expect(cardTab).toHaveAttribute('aria-selected', 'true');
    expect(heroTab).toHaveAttribute('aria-selected', 'false');
    expect(heroLgTab).toHaveAttribute('aria-selected', 'false');
    expect(document.getElementById('admin-cover-crop-panel-card')).not.toHaveAttribute('hidden');
    expect(document.getElementById('admin-cover-crop-panel-hero')).toHaveAttribute('hidden');
    expect(document.querySelector('#admin-cover-crop-panel-card > div')).toHaveClass(
      'aspect-tour-card-cover',
      'max-w-tour-card',
    );
    expect(
      document.querySelector('#admin-cover-crop-panel-card')?.textContent,
    ).not.toContain(UI.hero.viewTour);

    cardTab.focus();
    await user.keyboard('{ArrowRight}');
    expect(heroTab).toHaveAttribute('aria-selected', 'true');
    expect(document.getElementById('admin-cover-crop-panel-hero')).not.toHaveAttribute('hidden');
    expect(document.querySelector('#admin-cover-crop-panel-hero > div')).toHaveClass(
      'aspect-tour-hero-phone',
      'max-w-tour-cover-preview-phone',
    );
    expect(document.querySelector('#admin-cover-crop-panel-hero')).toHaveTextContent(
      'Сопки уходят в море',
    );
    expect(document.querySelector('#admin-cover-crop-panel-hero')).toHaveTextContent(
      UI.hero.viewTour,
    );

    await user.click(heroLgTab);
    expect(heroLgTab).toHaveAttribute('aria-selected', 'true');
    expect(document.getElementById('admin-cover-crop-panel-heroLg')).not.toHaveAttribute('hidden');
    expect(document.querySelector('#admin-cover-crop-panel-heroLg > div')).toHaveClass(
      'aspect-tour-hero-lg',
    );
    expect(document.querySelector('#admin-cover-crop-panel-heroLg')).toHaveTextContent(
      UI.hero.viewTour,
    );
    expect(screen.getByLabelText(ADMIN_UI.heroPhraseLabel)).toHaveValue('Сопки уходят в море');
  });
});
