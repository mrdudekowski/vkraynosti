import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CmsTourDocument } from '../../cms/cmsTourDocument';
import { ADMIN_UI } from '../constants/ui';
import { AdminToastProvider } from './AdminToast';
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
    <AdminToastProvider>
      <BentoSection
        document={document}
        coverAssetId={null}
        prefaceAssetId={null}
        bento={document.bento}
        onBento={onBento}
        onPoolFiles={vi.fn()}
        onDeleteAsset={vi.fn()}
        uploading={false}
      />
    </AdminToastProvider>,
  );

describe('BentoSection', () => {
  it('рисует чипы схем, чтобы редактор тура не падал на галерее', () => {
    renderBento(baseDocument);
    expect(screen.getByRole('heading', { name: ADMIN_UI.galleryHeading })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: ADMIN_UI.poolLabel })).toBeInTheDocument();
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
    expect(screen.getByRole('heading', { name: ADMIN_UI.addBlock })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.changeBlockType })).toBeInTheDocument();
  });

  it('marks pool items as used or unused', () => {
    renderBento({
      ...baseDocument,
      assets: [
        unusedAsset,
        { id: 'g-1', stillUrl: 'https://cdn.example/g-1.webp', videoUrl: null, alt: 'Свободный кадр' },
      ],
      bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: unusedAsset.id }] }] },
    });

    expect(screen.getByText(ADMIN_UI.usedInGrid)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.unusedInGrid)).toBeInTheDocument();
  });

  it('по плюсу в ячейке открывает свободные кадры и загрузку с устройства', async () => {
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
    expect(within(dialog).getByText(ADMIN_UI.addMedia)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: unusedAsset.alt }));
    expect(onBento).toHaveBeenCalledWith({
      blocks: [{ type: 'bento-single', slots: [{ assetId: unusedAsset.id }] }],
    });
    expect(screen.queryByRole('dialog', { name: ADMIN_UI.pickUnusedTitle })).not.toBeInTheDocument();
  });

  it('по нажатию на файл пула открывает действия с ним', async () => {
    const user = userEvent.setup();
    renderBento({ ...baseDocument, assets: [unusedAsset] });

    await user.click(screen.getByRole('button', { name: unusedAsset.alt }));

    const dialog = screen.getByRole('dialog', { name: ADMIN_UI.poolAssetActions });
    expect(within(dialog).getByRole('button', { name: ADMIN_UI.addToBento })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: ADMIN_UI.deleteFromPool })).toBeInTheDocument();
  });

  it('из действий файла открывает выбор свободной ячейки', async () => {
    const user = userEvent.setup();
    renderBento({
      ...baseDocument,
      assets: [unusedAsset],
      bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: null }] }] },
    });

    await user.click(screen.getByRole('button', { name: unusedAsset.alt }));
    await user.click(screen.getByRole('button', { name: ADMIN_UI.addToBento }));

    expect(screen.getByRole('dialog', { name: ADMIN_UI.selectBentoSlot })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.emptySlot })).toBeInTheDocument();
  });
});
