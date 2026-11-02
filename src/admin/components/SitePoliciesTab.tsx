import type { PolicyContentDocument, SitePolicyKind } from '../../cms/siteContentDocument';
import { SITE_POLICY_KINDS } from '../../cms/siteContentDocument';
import { SITE_CONTENT_KIND_LABELS } from '../../cms/siteContentChanges';
import { ADMIN_UI } from '../constants/ui';
import { SITE_CONTENT_PDF_ACCEPT } from '../siteContentMediaAccept';
import { resolveSiteContentAssetUrl } from '../siteContentAssetUrl';
import AdminMediaDropzone from './AdminMediaDropzone';
import { AdminFieldLabel, AdminTextArea } from './AdminFields';
import SiteSectionTabs from './SiteSectionTabs';

type SitePoliciesTabProps = {
  policyKind: SitePolicyKind;
  value: PolicyContentDocument;
  onSelectPolicy: (kind: SitePolicyKind) => void;
  onChange: (value: PolicyContentDocument) => void;
  onUploadPdf: (file: File) => Promise<void>;
};

const pdfFileName = (url: string) => {
  const segment = url.split('/').pop();
  return segment != null && segment.length > 0 ? decodeURIComponent(segment) : url;
};

const SitePoliciesTab = ({
  policyKind,
  value,
  onSelectPolicy,
  onChange,
  onUploadPdf,
}: SitePoliciesTabProps) => {
  const currentFile = value.asset?.url
    ? pdfFileName(resolveSiteContentAssetUrl(value.asset.url))
    : ADMIN_UI.siteFooterPdfHint;
  const showHtmlEditor = value.documentId === 'personal-data-policy';

  return (
    <section
      id="admin-panel-policies"
      role="tabpanel"
      aria-labelledby="admin-tab-policies"
      className="flex flex-col gap-5"
    >
      <p className="text-sm text-text-muted">{ADMIN_UI.sitePoliciesHint}</p>
      <SiteSectionTabs
        label={ADMIN_UI.sitePoliciesTabs}
        value={policyKind}
        options={SITE_POLICY_KINDS.map((id) => ({ id, label: SITE_CONTENT_KIND_LABELS[id] }))}
        onChange={onSelectPolicy}
      />
      <div className="admin-editor-surface flex flex-col gap-4 p-4">
        <h2 className="text-base font-semibold">{SITE_CONTENT_KIND_LABELS[policyKind]}</h2>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="truncate text-sm text-text-muted">{currentFile}</p>
          <AdminMediaDropzone
            id={`${policyKind}-pdf`}
            label={ADMIN_UI.sitePolicyPdfHint}
            accept={SITE_CONTENT_PDF_ACCEPT}
            multiple={false}
            onFiles={(files) => {
              const file = files[0];
              if (file != null) void onUploadPdf(file);
            }}
          >
            {ADMIN_UI.sitePolicyPdf}
          </AdminMediaDropzone>
        </div>
        {showHtmlEditor ? (
          <div className="grid gap-1.5">
            <AdminFieldLabel htmlFor={`${policyKind}-body`}>{ADMIN_UI.sitePolicyBody}</AdminFieldLabel>
            <AdminTextArea
              id={`${policyKind}-body`}
              rows={18}
              value={value.bodyHtml}
              onChange={(event) => onChange({ ...value, bodyHtml: event.target.value })}
            />
            <p className="text-tooltip text-text-muted">{ADMIN_UI.sitePolicyBodyHint}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SitePoliciesTab;
