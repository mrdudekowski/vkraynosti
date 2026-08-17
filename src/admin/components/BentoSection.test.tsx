import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CmsTourDocument } from '../../cms/cmsTourDocument';
import { ADMIN_UI } from '../constants/ui';
import BentoSection from './BentoSection';

const baseDocument: CmsTourDocument = {
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
  prefaceAssetId: null,
  assets: [],
  bento: { blocks: [] },
  legacyGalleryVariant: null,
};

const unusedAsset = {
  id: 'g-0',
  stillUrl: 'https://cdn.example/g-0.webp',
  videoUrl: null,
  alt: 'Кадр из пула',
};

const renderBento = (document: CmsTourDocument, onBento = vi.fn()) =>
  render(
    <BentoSection
      document={document}
      coverAssetId={null}
      prefaceAssetId={null}
      bento={document.bento}
      onBento={onBento}
      onPoolFiles={vi.fn()}
      onDeleteAsset={vi.fn()}
      onAssetAlt={vi.fn()}
      uploading={false}
    />,
  );

describe('BentoSection', () => {
  it('рисует чипы схем, чтобы редактор тура не падал на галерее', () => {
    renderBento(baseDocument);
    expect(screen.getByRole('heading', { name: ADMIN_UI.galleryHeading })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.blockTypes['bento-vert'] })).toBeInTheDocument();
  });

  it('ставит чипы новых сеток под уже существующие блоки', () => {
    renderBento({
      ...baseDocument,
      bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: null }] }] },
    });

    const existingBlock = screen.getByText(ADMIN_UI.blockTypes['bento-single'], { selector: 'p' });
    const addChip = screen.getByRole('button', { name: ADMIN_UI.blockTypes['bento-vert'] });
    expect(existingBlock.compareDocumentPosition(addChip) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('по плюсу в ячейке открывает свободные кадры пула, а не выбор с устройства', async () => {
    const user = userEvent.setup();
    const onBento = vi.fn();
    renderBento(
      {
        ...baseDocument,
        assets: [unusedAsset],
        bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: null }] }] },
      },
      onBento,
    );

    await user.click(screen.getByRole('button', { name: ADMIN_UI.addToSlot }));

    const dialog = screen.getByRole('dialog', { name: ADMIN_UI.pickUnusedTitle });
    expect(dialog).toBeInTheDocument();
    expect(window.document.querySelectorAll('input[type="file"]')).toHaveLength(1);

    await user.click(within(dialog).getByRole('button', { name: unusedAsset.alt }));
    expect(onBento).toHaveBeenCalledWith({
      blocks: [{ type: 'bento-single', slots: [{ assetId: unusedAsset.id }] }],
    });
    expect(screen.queryByRole('dialog', { name: ADMIN_UI.pickUnusedTitle })).not.toBeInTheDocument();
  });
});
