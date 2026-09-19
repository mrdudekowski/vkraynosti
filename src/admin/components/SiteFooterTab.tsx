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
import AdminEditorSurface from './AdminEditorSurface';
import AdminEmptyState from './AdminEmptyState';
import { AdminFieldLabel, AdminTextInput } from './AdminFields';
import AdminIconButton from './AdminIconButton';
import AdminMediaDropzone from './AdminMediaDropzone';
import AdminSelect from './AdminSelect';

type SiteFooterTabProps = {
  value: FooterContentDocument;
  onChange: (value: FooterContentDocument) => void;
  onUploadPdf: (blockId: string, rowId: string, file: File) => Promise<void>;
};

const ROW_TYPES = ['text', 'link', 'pdf'] as const;

const rowTypeLabel = (type: FooterContentRow['type']) => ADMIN_UI.siteFooterRowTypes[type];

const emptyTextRow = (order: number): FooterContentRow => ({
  id: `row-${Date.now()}`,
  label: ADMIN_UI.siteNewRowLabel,
  visible: true,
  order,
  type: 'text',
  value: '',
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
      className="flex flex-col gap-3"
    >
      {blocks.length === 0 ? (
        <AdminEditorSurface
          icon={PanelBottom}
          title={ADMIN_UI.siteTabFooter}
          hint={ADMIN_UI.siteFooterHint}
        >
          <AdminEmptyState
            title={ADMIN_UI.siteFooterEmpty}
            description={ADMIN_UI.siteFooterEmptyHint}
            action={
              <AdminButton
                variant="secondary"
                onClick={() =>
                  replaceBlocks([
                    {
                      id: `block-${Date.now()}`,
                      heading: ADMIN_UI.siteNewBlockHeading,
                      visible: true,
                      order: 0,
                      rows: [],
                    },
                  ])
                }
              >
                <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
                {ADMIN_UI.siteAddBlock}
              </AdminButton>
            }
          />
        </AdminEditorSurface>
      ) : (
        blocks.map((block, blockIndex) => {
          const rows = [...block.rows].sort((left, right) => left.order - right.order);
          return (
            <AdminEditorSurface
              key={block.id}
              icon={PanelBottom}
              title={block.heading.trim() || ADMIN_UI.siteTabFooter}
              hint={blockIndex === 0 ? ADMIN_UI.siteFooterHint : undefined}
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="flex flex-col gap-1">
                  <AdminFieldLabel htmlFor={`${block.id}-heading`}>
                    {ADMIN_UI.siteBlockHeading}
                  </AdminFieldLabel>
                  <AdminTextInput
                    id={`${block.id}-heading`}
                    value={block.heading}
                    onChange={(event) => patchBlock(block.id, { heading: event.target.value })}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <label className="inline-flex min-h-11 items-center gap-2 text-sm text-text-primary">
                    <input
                      type="checkbox"
                      checked={block.visible}
                      onChange={(event) =>
                        patchBlock(block.id, { visible: event.target.checked })
                      }
                    />
                    <span>{ADMIN_UI.siteShowBlock}</span>
                  </label>
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
              <ul className="flex flex-col gap-2">
                {rows.map((row, rowIndex) => (
                  <li
                    key={row.id}
                    className="admin-editor-row flex-wrap items-end gap-2 border-t border-divider p-2 pt-3 admin-desktop:flex-nowrap"
                  >
                    <div className="flex min-w-0 flex-col gap-1 basis-full sm:basis-36">
                      <AdminFieldLabel htmlFor={`${row.id}-type`}>
                        {ADMIN_UI.siteFooterRowType}
                      </AdminFieldLabel>
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
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1 basis-full sm:basis-40">
                      <AdminFieldLabel htmlFor={`${row.id}-label`}>
                        {ADMIN_UI.siteFooterRowLabel}
                      </AdminFieldLabel>
                      <AdminTextInput
                        id={`${row.id}-label`}
                        value={row.label}
                        onChange={(event) =>
                          patchRow(block.id, row.id, { ...row, label: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1 basis-full sm:basis-40">
                      <AdminFieldLabel htmlFor={`${row.id}-value`}>
                        {ADMIN_UI.siteFooterRowValue}
                      </AdminFieldLabel>
                      <AdminTextInput
                        id={`${row.id}-value`}
                        value={row.value}
                        onChange={(event) =>
                          patchRow(block.id, row.id, { ...row, value: event.target.value })
                        }
                      />
                    </div>
                    {row.type === 'link' ? (
                      <div className="flex min-w-0 flex-1 flex-col gap-1 basis-full sm:basis-48">
                        <AdminFieldLabel htmlFor={`${row.id}-href`}>
                          {ADMIN_UI.siteFooterHref}
                        </AdminFieldLabel>
                        <AdminTextInput
                          id={`${row.id}-href`}
                          inputMode="url"
                          value={row.href}
                          onChange={(event) =>
                            patchRow(block.id, row.id, { ...row, href: event.target.value })
                          }
                        />
                      </div>
                    ) : null}
                    {row.type === 'pdf' ? (
                      <div className="flex min-w-0 flex-col gap-1 basis-full sm:basis-48">
                        <span className="text-sm font-medium text-text-primary">
                          {ADMIN_UI.siteFooterPdf}
                        </span>
                        {row.asset?.url != null && row.asset.url.length > 0 ? (
                          <p className="truncate text-sm text-text-muted">
                            {resolveSiteContentAssetUrl(row.asset.url)}
                          </p>
                        ) : (
                          <p className="text-tooltip text-text-muted">{ADMIN_UI.siteFooterPdfHint}</p>
                        )}
                        <AdminMediaDropzone
                          id={`${row.id}-pdf`}
                          label={ADMIN_UI.siteFooterPdfHint}
                          accept={SITE_CONTENT_PDF_ACCEPT}
                          multiple={false}
                          onFiles={(files) => {
                            const file = files[0];
                            if (file != null) void onUploadPdf(block.id, row.id, file);
                          }}
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-1">
                      <label className="inline-flex min-h-11 items-center gap-2 text-sm text-text-primary">
                        <input
                          type="checkbox"
                          checked={row.visible}
                          onChange={(event) =>
                            patchRow(block.id, row.id, { ...row, visible: event.target.checked })
                          }
                        />
                        <span>{ADMIN_UI.siteShowRow}</span>
                      </label>
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
                                    rows: withOrder(rows.filter((candidate) => candidate.id !== row.id)),
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
            </AdminEditorSurface>
          );
        })
      )}
      {blocks.length > 0 ? (
        <AdminButton
          variant="secondary"
          className="w-fit"
          onClick={() =>
            replaceBlocks([
              ...value.blocks,
              {
                id: `block-${Date.now()}`,
                heading: ADMIN_UI.siteNewBlockHeading,
                visible: true,
                order: value.blocks.length,
                rows: [],
              },
            ])
          }
        >
          <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
          {ADMIN_UI.siteAddBlock}
        </AdminButton>
      ) : null}
    </section>
  );
};

export default SiteFooterTab;
