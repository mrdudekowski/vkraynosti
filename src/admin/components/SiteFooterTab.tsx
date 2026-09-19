import { ChevronDown, ChevronUp, PanelBottom, Plus, Trash2 } from 'lucide-react';
import type {
  FooterContentBlock,
  FooterContentDocument,
  FooterContentRow,
} from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import { SITE_CONTENT_PDF_ACCEPT } from '../siteContentMediaAccept';
import { resolveSiteContentAssetUrl } from '../siteContentAssetUrl';
import { moveOrdered, withOrder } from '../siteContentOrder';
import { useAdminToast } from '../toast/adminToastContext';
import { pushAdminUndo } from '../toast/pushAdminUndo';
import AdminButton from './AdminButton';
import AdminEmptyState from './AdminEmptyState';
import { AdminTextInput } from './AdminFields';
import AdminIconButton from './AdminIconButton';
import AdminMediaDropzone from './AdminMediaDropzone';
import { AdminOnSiteToggle } from './AdminOnSiteStatus';
import AdminSelect from './AdminSelect';

type SiteFooterTabProps = {
  value: FooterContentDocument;
  onChange: (value: FooterContentDocument) => void;
  onUploadPdf: (blockId: string, rowId: string, file: File) => Promise<void>;
};

const ROW_TYPES = ['text', 'link', 'pdf'] as const;

const FOOTER_ROW_CLASS =
  'flex flex-col gap-2 rounded-admin-control border border-divider bg-surface-light p-3 admin-desktop:grid admin-desktop:grid-cols-[7rem_minmax(12rem,1.4fr)_minmax(8rem,0.7fr)_minmax(12rem,1fr)_auto_auto] admin-desktop:items-center admin-desktop:gap-2 admin-desktop:border-0 admin-desktop:bg-transparent admin-desktop:px-1 admin-desktop:py-2';

const rowTypeLabel = (type: FooterContentRow['type']) => ADMIN_UI.siteFooterRowTypes[type];

const emptyTextRow = (order: number): FooterContentRow => ({
  id: `row-${Date.now()}`,
  label: ADMIN_UI.siteNewRowLabel,
  visible: true,
  order,
  type: 'text',
  value: '',
});

const emptyBlock = (order: number): FooterContentBlock => ({
  id: `block-${Date.now()}`,
  heading: ADMIN_UI.siteNewBlockHeading,
  visible: true,
  order,
  rows: [],
});

const toRowType = (row: FooterContentRow, type: FooterContentRow['type']): FooterContentRow => {
  const base = {
    id: row.id,
    label: row.label,
    icon: row.icon,
    visible: row.visible,
    order: row.order,
  };
  if (type === 'link') {
    return {
      ...base,
      type: 'link',
      value: row.value,
      href: row.type === 'link' ? row.href : 'https://',
    };
  }
  if (type === 'pdf') {
    return {
      ...base,
      type: 'pdf',
      value: row.value,
      documentId: row.type === 'pdf' ? row.documentId : `pdf-${row.id}`,
      asset: row.type === 'pdf' ? row.asset : undefined,
    };
  }
  return { ...base, type: 'text', value: row.value };
};

const pdfFileName = (url: string) => {
  const segment = url.split('/').pop();
  return segment != null && segment.length > 0 ? decodeURIComponent(segment) : url;
};

const SiteFooterTab = ({ value, onChange, onUploadPdf }: SiteFooterTabProps) => {
  const { push } = useAdminToast();
  const blocks = [...value.blocks].sort((left, right) => left.order - right.order);

  const replaceBlocks = (nextBlocks: FooterContentBlock[], message?: string) => {
    const previous = value.blocks;
    onChange({ ...value, blocks: nextBlocks });
    if (message != null) {
      pushAdminUndo(push, message, () => onChange({ ...value, blocks: previous }));
    }
  };

  const patchBlock = (blockId: string, patch: Partial<FooterContentBlock>) => {
    onChange({
      ...value,
      blocks: value.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
    });
  };

  const patchRow = (blockId: string, rowId: string, nextRow: FooterContentRow) => {
    onChange({
      ...value,
      blocks: value.blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              rows: block.rows.map((row) => (row.id === rowId ? nextRow : row)),
            }
          : block,
      ),
    });
  };

  return (
    <section
      id="admin-panel-footer"
      role="tabpanel"
      aria-labelledby="admin-tab-footer"
      className="flex flex-col gap-5"
    >
      <p className="text-sm text-text-muted">{ADMIN_UI.siteFooterHint}</p>
      {blocks.length === 0 ? (
        <AdminEmptyState
          icon={PanelBottom}
          title={ADMIN_UI.siteFooterEmpty}
          description={ADMIN_UI.siteFooterEmptyHint}
          action={
            <AdminButton variant="secondary" onClick={() => replaceBlocks([emptyBlock(0)])}>
              <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
              {ADMIN_UI.siteAddBlock}
            </AdminButton>
          }
        />
      ) : (
        <ul className="flex flex-col gap-5">
          {blocks.map((block, blockIndex) => {
            const rows = [...block.rows].sort((left, right) => left.order - right.order);
            return (
              <li key={block.id} className="admin-editor-surface flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminTextInput
                    id={`${block.id}-heading`}
                    className="min-w-0 flex-1"
                    aria-label={ADMIN_UI.siteBlockHeading}
                    placeholder={ADMIN_UI.siteBlockHeading}
                    value={block.heading}
                    onChange={(event) => patchBlock(block.id, { heading: event.target.value })}
                  />
                  <AdminOnSiteToggle
                    visible={block.visible}
                    label={ADMIN_UI.siteShowBlock}
                    onChange={(visible) => patchBlock(block.id, { visible })}
                  />
                  <div className="flex items-center gap-1">
                    <AdminIconButton
                      icon={ChevronUp}
                      label={ADMIN_UI.moveUp}
                      disabled={blockIndex === 0}
                      onClick={() => replaceBlocks(moveOrdered(blocks, blockIndex, -1))}
                    />
                    <AdminIconButton
                      icon={ChevronDown}
                      label={ADMIN_UI.moveDown}
                      disabled={blockIndex === blocks.length - 1}
                      onClick={() => replaceBlocks(moveOrdered(blocks, blockIndex, 1))}
                    />
                    <AdminIconButton
                      icon={Trash2}
                      label={ADMIN_UI.removeItem}
                      danger
                      onClick={() =>
                        replaceBlocks(
                          withOrder(blocks.filter((item) => item.id !== block.id)),
                          ADMIN_UI.listItemRemoved,
                        )
                      }
                    />
                  </div>
                </div>
                {rows.length > 0 ? (
                  <div>
                    <div className="mb-1 hidden grid-cols-[7rem_minmax(12rem,1.4fr)_minmax(8rem,0.7fr)_minmax(12rem,1fr)_auto_auto] gap-2 px-1 text-xs font-medium text-text-muted admin-desktop:grid">
                      <span>{ADMIN_UI.siteFooterRowType}</span>
                      <span>{ADMIN_UI.siteFooterRowValue}</span>
                      <span>{ADMIN_UI.siteFooterRowLabel}</span>
                      <span>{ADMIN_UI.siteFooterHref}</span>
                      <span />
                      <span />
                    </div>
                    <ul className="flex flex-col gap-2 admin-desktop:gap-0">
                      {rows.map((row, rowIndex) => (
                        <li key={row.id} className={FOOTER_ROW_CLASS}>
                          <AdminSelect
                            id={`${row.id}-type`}
                            aria-label={ADMIN_UI.siteFooterRowType}
                            value={row.type}
                            onChange={(event) =>
                              patchRow(
                                block.id,
                                row.id,
                                toRowType(row, event.target.value as FooterContentRow['type']),
                              )
                            }
                          >
                            {ROW_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {rowTypeLabel(type)}
                              </option>
                            ))}
                          </AdminSelect>
                          <AdminTextInput
                            id={`${row.id}-value`}
                            aria-label={ADMIN_UI.siteFooterRowValue}
                            value={row.value}
                            onChange={(event) =>
                              patchRow(block.id, row.id, { ...row, value: event.target.value })
                            }
                          />
                          <AdminTextInput
                            id={`${row.id}-label`}
                            aria-label={ADMIN_UI.siteFooterRowLabel}
                            placeholder={ADMIN_UI.siteFooterRowLabel}
                            value={row.label}
                            onChange={(event) =>
                              patchRow(block.id, row.id, { ...row, label: event.target.value })
                            }
                          />
                          {row.type === 'link' ? (
                            <AdminTextInput
                              id={`${row.id}-href`}
                              aria-label={ADMIN_UI.siteFooterHref}
                              inputMode="url"
                              value={row.href}
                              onChange={(event) =>
                                patchRow(block.id, row.id, { ...row, href: event.target.value })
                              }
                            />
                          ) : row.type === 'pdf' ? (
                            <div className="flex min-w-0 flex-col gap-1">
                              {row.asset?.url != null && row.asset.url.length > 0 ? (
                                <p className="truncate text-tooltip text-text-muted">
                                  {pdfFileName(resolveSiteContentAssetUrl(row.asset.url))}
                                </p>
                              ) : (
                                <p className="text-tooltip text-text-muted">
                                  {ADMIN_UI.siteFooterPdfHint}
                                </p>
                              )}
                              <AdminMediaDropzone
                                id={`${row.id}-pdf`}
                                label={ADMIN_UI.siteFooterPdfHint}
                                accept={SITE_CONTENT_PDF_ACCEPT}
                                multiple={false}
                                className="min-h-11 py-1"
                                onFiles={(files) => {
                                  const file = files[0];
                                  if (file != null) void onUploadPdf(block.id, row.id, file);
                                }}
                              >
                                {ADMIN_UI.siteFooterPdf}
                              </AdminMediaDropzone>
                            </div>
                          ) : (
                            <span className="hidden admin-desktop:block" />
                          )}
                          <AdminOnSiteToggle
                            visible={row.visible}
                            label={ADMIN_UI.siteShowRow}
                            onChange={(visible) =>
                              patchRow(block.id, row.id, { ...row, visible })
                            }
                          />
                          <div className="flex flex-wrap items-center gap-1">
                            <AdminIconButton
                              icon={ChevronUp}
                              label={ADMIN_UI.moveUp}
                              disabled={rowIndex === 0}
                              onClick={() =>
                                patchBlock(block.id, { rows: moveOrdered(rows, rowIndex, -1) })
                              }
                            />
                            <AdminIconButton
                              icon={ChevronDown}
                              label={ADMIN_UI.moveDown}
                              disabled={rowIndex === rows.length - 1}
                              onClick={() =>
                                patchBlock(block.id, { rows: moveOrdered(rows, rowIndex, 1) })
                              }
                            />
                            <AdminIconButton
                              icon={Trash2}
                              label={ADMIN_UI.removeItem}
                              danger
                              onClick={() =>
                                replaceBlocks(
                                  value.blocks.map((item) =>
                                    item.id === block.id
                                      ? {
                                          ...item,
                                          rows: withOrder(
                                            rows.filter((candidate) => candidate.id !== row.id),
                                          ),
                                        }
                                      : item,
                                  ),
                                  ADMIN_UI.listItemRemoved,
                                )
                              }
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <AdminButton
                  variant="secondary"
                  className="self-start"
                  onClick={() =>
                    patchBlock(block.id, { rows: [...block.rows, emptyTextRow(block.rows.length)] })
                  }
                >
                  <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
                  {ADMIN_UI.siteAddRow}
                </AdminButton>
              </li>
            );
          })}
        </ul>
      )}
      {blocks.length > 0 ? (
        <AdminButton
          variant="secondary"
          className="w-fit"
          onClick={() => replaceBlocks([...value.blocks, emptyBlock(value.blocks.length)])}
        >
          <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
          {ADMIN_UI.siteAddBlock}
        </AdminButton>
      ) : null}
    </section>
  );
};

export default SiteFooterTab;
