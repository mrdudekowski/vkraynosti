import { ChevronDown, ChevronUp, GripVertical, Images, LayoutGrid, Plus, Trash2 } from 'lucide-react';
import { useState, type DragEvent } from 'react';
import {
  BENTO_BLOCK_GRID_CLASS,
  BENTO_BLOCK_TYPES,
  BENTO_SINGLE_BLOCK_GRID_CLASS,
  BENTO_SLOT_PLACEMENTS,
  getBentoSlotTileClassName,
} from '../../constants/tourBento';
import { unusedBentoPoolAssets, bentoPoolAssets } from '../../cms/bentoPoolAssets';
import type { CmsTourDocument } from '../../cms/cmsTourDocument';
import {
  createEmptyBentoBlock,
  placeAssetInSlot,
  retargetBentoBlock,
  setSlotObjectPosition,
  swapBentoSlots,
} from '../bentoDraft';
import { cmsAssetHasVideo } from '../cmsAssetHasVideo';
import { ADMIN_UI } from '../constants/ui';
import { moveItem } from '../moveItem';
import { EDITOR_FOCUS_IDS } from '../tourEditorTabs';
import { useAdminToast } from '../toast/adminToastContext';
import { pushAdminUndo } from '../toast/pushAdminUndo';
import AdminAssetPreview, { AdminVideoBadge } from './AdminAssetPreview';
import AdminEditorSurface from './AdminEditorSurface';
import AdminFocalPoint from './AdminFocalPoint';
import AdminIconButton from './AdminIconButton';
import AdminMediaDropzone from './AdminMediaDropzone';
import AdminUnusedMediaPicker from './AdminUnusedMediaPicker';
import BentoLayoutChip from './BentoLayoutChip';

const ASSET_DRAG = 'application/x-vkr-cms-asset';
const SLOT_DRAG = 'application/x-vkr-cms-slot';
const BLOCK_DRAG = 'application/x-vkr-cms-block';

type BentoSectionProps = {
  document: CmsTourDocument;
  coverAssetId: string | null;
  prefaceAssetId: string | null;
  bento: CmsTourDocument['bento'];
  onBento: (bento: CmsTourDocument['bento']) => void;
  onPoolFiles: (files: File[]) => Promise<void>;
  onDeleteAsset: (assetId: string) => Promise<void>;
  uploading: boolean;
};

type SlotRef = { blockIndex: number; slotIndex: number };

const parseSlotRef = (raw: string): SlotRef | null => {
  const [blockRaw, slotRaw] = raw.split(':');
  const blockIndex = Number.parseInt(blockRaw ?? '', 10);
  const slotIndex = Number.parseInt(slotRaw ?? '', 10);
  if (!Number.isInteger(blockIndex) || !Number.isInteger(slotIndex)) {
    return null;
  }
  return { blockIndex, slotIndex };
};

const filesFromTransfer = (event: DragEvent<HTMLElement>): File[] => [...event.dataTransfer.files];

const BentoSection = ({
  document,
  coverAssetId,
  prefaceAssetId,
  bento,
  onBento,
  onPoolFiles,
  onDeleteAsset,
  uploading,
}: BentoSectionProps) => {
  const { push } = useAdminToast();
  const [slotTarget, setSlotTarget] = useState<SlotRef | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(true);
  const [typeMenu, setTypeMenu] = useState<number | null>(null);

  const poolDocument = { ...document, coverAssetId, prefaceAssetId, bento };
  const unused = unusedBentoPoolAssets(poolDocument);
  const pool = bentoPoolAssets(poolDocument);
  const usedAssetIds = new Set(
    bento.blocks.flatMap((block) =>
      block.slots
        .map((slot) => slot.assetId)
        .filter((assetId): assetId is string => assetId != null && assetId.length > 0),
    ),
  );
  const firstEmptySlot = bento.blocks.flatMap((block, blockIndex) =>
    block.slots.map((slot, slotIndex) => ({ blockIndex, slotIndex, empty: slot.assetId == null || slot.assetId.length === 0 })),
  ).find((slot) => slot.empty) ?? null;

  const dropAsset = (blockIndex: number, slotIndex: number, assetId: string) => {
    onBento(placeAssetInSlot(bento, blockIndex, slotIndex, assetId));
  };

  const onSlotDrop = (event: DragEvent<HTMLElement>, blockIndex: number, slotIndex: number) => {
    event.preventDefault();
    if (filesFromTransfer(event).length > 0) {
      return;
    }
    const fromSlot = parseSlotRef(event.dataTransfer.getData(SLOT_DRAG));
    if (fromSlot != null) {
      onBento(swapBentoSlots(bento, fromSlot.blockIndex, fromSlot.slotIndex, blockIndex, slotIndex));
      return;
    }
    const assetId = event.dataTransfer.getData(ASSET_DRAG);
    if (assetId.length > 0) {
      dropAsset(blockIndex, slotIndex, assetId);
    }
  };

  const onGalleryDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const droppedFiles = filesFromTransfer(event);
    if (droppedFiles.length > 0) {
      void onPoolFiles(droppedFiles);
      return;
    }
    const fromSlot = parseSlotRef(event.dataTransfer.getData(SLOT_DRAG));
    if (fromSlot == null) {
      return;
    }
    onBento(placeAssetInSlot(bento, fromSlot.blockIndex, fromSlot.slotIndex, null));
  };

  const onBlockDrop = (event: DragEvent<HTMLElement>, targetIndex: number) => {
    const fromRaw = event.dataTransfer.getData(BLOCK_DRAG);
    const fromIndex = Number.parseInt(fromRaw, 10);
    if (!Number.isInteger(fromIndex) || fromIndex === targetIndex) {
      return;
    }
    const direction = fromIndex < targetIndex ? 1 : -1;
    let next = bento.blocks;
    let current = fromIndex;
    while (current !== targetIndex) {
      next = moveItem(next, current, direction);
      current += direction;
    }
    onBento({ blocks: next });
    pushAdminUndo(push, ADMIN_UI.listReordered, () => onBento(bento));
  };

  return (
    <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
      {slotTarget != null ? (
        <AdminUnusedMediaPicker
          assets={unused}
          onSelect={(assetId) => {
            dropAsset(slotTarget.blockIndex, slotTarget.slotIndex, assetId);
            setSlotTarget(null);
          }}
          onClose={() => setSlotTarget(null)}
        />
      ) : null}
      <AdminEditorSurface
        icon={LayoutGrid}
        title={ADMIN_UI.galleryHeading}
        hint={ADMIN_UI.requiredForPublish}
        className="min-w-0"
      >
        <ol className="admin-editor-list flex flex-col gap-2">
          {bento.blocks.map((block, blockIndex) => {
            const placements = BENTO_SLOT_PLACEMENTS[block.type];
            const gridClassName =
              block.type === 'bento-single' || block.type === 'bento-wide-square'
                ? BENTO_SINGLE_BLOCK_GRID_CLASS
                : BENTO_BLOCK_GRID_CLASS;
            return (
              <li
                key={`block-${blockIndex}`}
                className="flex flex-col gap-2 rounded-card border border-divider p-2 transition-shadow duration-admin motion-reduce:transition-none hover:shadow-admin-overlay"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => onBlockDrop(event, blockIndex)}
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    draggable
                    className="admin-icon-btn cursor-grab"
                    aria-label={ADMIN_UI.dragBlock}
                    onDragStart={(event) => {
                      event.dataTransfer.setData(BLOCK_DRAG, String(blockIndex));
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                  >
                    <GripVertical aria-hidden size={16} strokeWidth={1.75} />
                  </button>
                  <p className="min-w-0 flex-1 text-sm font-medium text-text-primary">
                    {ADMIN_UI.blockTypes[block.type]}
                  </p>
                  <button
                    type="button"
                    className="admin-btn-secondary text-tooltip"
                    onClick={() => setTypeMenu((current) => (current === blockIndex ? null : blockIndex))}
                  >
                    {ADMIN_UI.changeBlockType}
                  </button>
                  <AdminIconButton
                    icon={ChevronUp}
                    label={ADMIN_UI.moveUp}
                    disabled={blockIndex === 0}
                    onClick={() => {
                      const next = moveItem(bento.blocks, blockIndex, -1);
                      if (next === bento.blocks) {
                        return;
                      }
                      onBento({ blocks: next });
                      pushAdminUndo(push, ADMIN_UI.listReordered, () => onBento(bento));
                    }}
                  />
                  <AdminIconButton
                    icon={ChevronDown}
                    label={ADMIN_UI.moveDown}
                    disabled={blockIndex === bento.blocks.length - 1}
                    onClick={() => {
                      const next = moveItem(bento.blocks, blockIndex, 1);
                      if (next === bento.blocks) {
                        return;
                      }
                      onBento({ blocks: next });
                      pushAdminUndo(push, ADMIN_UI.listReordered, () => onBento(bento));
                    }}
                  />
                  <AdminIconButton
                    icon={Trash2}
                    label={ADMIN_UI.removeItem}
                    danger
                    onClick={() => {
                      const previous = bento;
                      onBento({
                        blocks: bento.blocks.filter((_, index) => index !== blockIndex),
                      });
                      pushAdminUndo(push, ADMIN_UI.listItemRemoved, () => onBento(previous));
                    }}
                  />
                </div>
                {typeMenu === blockIndex ? (
                  <div className="flex flex-wrap gap-2">
                    {BENTO_BLOCK_TYPES.map((type) => (
                      <BentoLayoutChip
                        key={`retarget-${type}`}
                        type={type}
                        selected={type === block.type}
                        onClick={() => {
                          onBento({
                            blocks: bento.blocks.map((current, index) =>
                              index === blockIndex ? retargetBentoBlock(current, type) : current,
                            ),
                          });
                          setTypeMenu(null);
                        }}
                      />
                    ))}
                  </div>
                ) : null}
                <div className={gridClassName}>
                  {block.slots.map((slot, slotIndex) => {
                    const asset =
                      slot.assetId != null
                        ? document.assets.find((item) => item.id === slot.assetId)
                        : undefined;
                    const placement = placements[slotIndex];
                    const slotEmpty = slot.assetId == null || slot.assetId.length === 0;
                    const isFirstEmpty =
                      firstEmptySlot != null &&
                      firstEmptySlot.blockIndex === blockIndex &&
                      firstEmptySlot.slotIndex === slotIndex;
                    return (
                      <div
                        key={`slot-${blockIndex}-${slotIndex}`}
                        className={`${placement != null ? getBentoSlotTileClassName(placement) : ''} relative min-h-20 overflow-hidden rounded-card border ${
                          slotEmpty ? 'admin-row-warning border-difficulty-medium-fg/40' : 'border-divider'
                        }`}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => onSlotDrop(event, blockIndex, slotIndex)}
                      >
                        {asset != null ? (
                          <AdminFocalPoint
                            capture="handle"
                            objectPosition={slot.objectPosition}
                            onChange={(nextPosition) =>
                              onBento(
                                setSlotObjectPosition(bento, blockIndex, slotIndex, nextPosition),
                              )
                            }
                          >
                            <button
                              type="button"
                              draggable
                              className="relative h-full w-full"
                              aria-label={asset.alt || slot.assetId || ADMIN_UI.emptySlot}
                              onDragStart={(event) => {
                                event.dataTransfer.setData(ASSET_DRAG, asset.id);
                                event.dataTransfer.setData(SLOT_DRAG, `${blockIndex}:${slotIndex}`);
                                event.dataTransfer.effectAllowed = 'move';
                              }}
                            >
                              <AdminAssetPreview
                                key={asset.id}
                                asset={asset}
                                play
                                className="h-full w-full"
                                objectPosition={slot.objectPosition}
                              />
                              {cmsAssetHasVideo(asset) ? <AdminVideoBadge /> : null}
                            </button>
                          </AdminFocalPoint>
                        ) : (
                          <button
                            type="button"
                            id={isFirstEmpty ? EDITOR_FOCUS_IDS.bentoEmpty : undefined}
                            className="flex h-full min-h-20 w-full flex-col items-center justify-center gap-1 text-text-muted"
                            aria-label={ADMIN_UI.addToSlot}
                            disabled={uploading}
                            onClick={() => setSlotTarget({ blockIndex, slotIndex })}
                          >
                            <Plus aria-hidden size={16} strokeWidth={1.75} />
                            <span className="text-tooltip">{ADMIN_UI.emptySlot}</span>
                          </button>
                        )}
                        {slot.assetId != null ? (
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-card bg-surface-light px-2 py-1 text-tooltip text-text-muted"
                            aria-label={ADMIN_UI.removeItem}
                            onClick={() =>
                              onBento(placeAssetInSlot(bento, blockIndex, slotIndex, null))
                            }
                          >
                            {ADMIN_UI.removeItem}
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>
        <div className="rounded-card border border-dashed border-divider p-2">
          <h3 className="text-sm font-semibold text-text-primary">{ADMIN_UI.addBlock}</h3>
          <p className="mt-1 text-tooltip text-text-muted">{ADMIN_UI.addBlockHint}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BENTO_BLOCK_TYPES.map((type) => (
              <BentoLayoutChip
                key={type}
                type={type}
                onClick={() => onBento({ blocks: [...bento.blocks, createEmptyBentoBlock(type)] })}
              />
            ))}
          </div>
        </div>
      </AdminEditorSurface>

      <div
        className="min-w-0 xl:sticky xl:top-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onGalleryDrop}
      >
        <AdminEditorSurface icon={Images} title={ADMIN_UI.poolLabel}>
        <button
          type="button"
          className="min-h-11 text-left text-sm font-medium text-text-primary"
          onClick={() => setGalleryOpen((open) => !open)}
        >
          {galleryOpen ? ADMIN_UI.collapseGallery : ADMIN_UI.expandGallery}
        </button>
        {galleryOpen ? (
          <>
            <AdminMediaDropzone
              id="cms-pool-upload"
              label={ADMIN_UI.dropMedia}
              disabled={uploading}
              onFiles={(files) => void onPoolFiles(files)}
            />
            {pool.length === 0 ? (
              <p className="text-sm text-text-muted">{ADMIN_UI.poolEmpty}</p>
            ) : (
              <ul className="admin-editor-list flex flex-col gap-2">
                {pool.map((asset) => {
                  const used = usedAssetIds.has(asset.id);
                  return (
                    <li key={asset.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        draggable={!used}
                        className="relative h-12 w-14 shrink-0 overflow-hidden rounded-admin-control border border-divider"
                        aria-label={asset.alt || asset.id}
                        onDragStart={(event) => {
                          if (used) {
                            event.preventDefault();
                            return;
                          }
                          event.dataTransfer.setData(ASSET_DRAG, asset.id);
                          event.dataTransfer.effectAllowed = 'move';
                        }}
                      >
                        <AdminAssetPreview
                          asset={asset}
                          play={false}
                          className="h-full w-full"
                        />
                        {cmsAssetHasVideo(asset) ? <AdminVideoBadge /> : null}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-text-primary">
                          {asset.alt || asset.id}
                        </p>
                        <p className="text-tooltip text-text-muted">
                          {used ? ADMIN_UI.usedInGrid : ADMIN_UI.unusedInGrid}
                        </p>
                      </div>
                      {used ? null : (
                        <AdminIconButton
                          icon={Trash2}
                          label={ADMIN_UI.deleteAsset}
                          danger
                          onClick={() => {
                            if (window.confirm(ADMIN_UI.confirmDeleteAsset)) {
                              void onDeleteAsset(asset.id);
                            }
                          }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <ul className="flex flex-col gap-1">
            {pool.map((asset) => (
              <li key={asset.id}>
                <button
                  type="button"
                  draggable={!usedAssetIds.has(asset.id)}
                  className="relative overflow-hidden rounded-card border border-divider"
                  aria-label={asset.alt || asset.id}
                  onDragStart={(event) => {
                    if (usedAssetIds.has(asset.id)) {
                      event.preventDefault();
                      return;
                    }
                    event.dataTransfer.setData(ASSET_DRAG, asset.id);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <AdminAssetPreview asset={asset} play={false} className="aspect-square w-full" />
                  {cmsAssetHasVideo(asset) ? <AdminVideoBadge /> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
        </AdminEditorSurface>
      </div>
    </section>
  );
};

export default BentoSection;
