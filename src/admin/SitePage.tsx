import { useCallback, useEffect, useRef, useState } from 'react';
import { Save, UploadCloud } from 'lucide-react';
import {
  adminGetSiteContent,
  adminPublishSiteContent,
  adminSaveSiteContent,
  adminUploadSiteAsset,
} from './api';
import AdminAlert from './components/AdminAlert';
import AdminButton from './components/AdminButton';
import AdminErrorState from './components/AdminErrorState';
import AdminPageFrame from './components/AdminPageFrame';
import AdminPageHeader from './components/AdminPageHeader';
import AdminSkeleton from './components/AdminSkeleton';
import AdminStatus from './components/AdminStatus';
import AdminStickyContextBar from './components/AdminStickyContextBar';
import MediaConversionModal from './components/MediaConversionModal';
import SiteContactsTab from './components/SiteContactsTab';
import SiteFooterTab from './components/SiteFooterTab';
import SiteModalTab from './components/SiteModalTab';
import SiteSectionTabs from './components/SiteSectionTabs';
import SiteTeamTab from './components/SiteTeamTab';
import { ADMIN_UI } from './constants/ui';
import { useAdminAutosave } from './hooks/useAdminAutosave';
import { isSiteContentImageFile, isSiteContentPdfFile } from './siteContentMediaAccept';
import { isHeicCmsFile } from './prepareCmsUploads';
import { siteContentBlocker } from './siteContentReady';
import type {
  ContactsContentDocument,
  FooterContentDocument,
  ModalContentDocument,
  SiteContentDocument,
  TeamContentDocument,
} from '../cms/siteContentDocument';

type Kind = 'team' | 'contacts' | 'footer' | 'modal';
type LoadErrors = Partial<Record<Kind, string>>;
type TabStatus = 'saved' | 'dirty' | 'saving' | 'published' | 'error';

const SITE_TABS: Array<{ id: Kind; label: string }> = [
  { id: 'team', label: ADMIN_UI.siteTabTeam },
  { id: 'contacts', label: ADMIN_UI.siteTabContacts },
  { id: 'footer', label: ADMIN_UI.siteTabFooter },
  { id: 'modal', label: ADMIN_UI.siteTabModal },
];

const tabFromHash = (): Kind => {
  const query = location.hash.split('?')[1];
  const requested = new URLSearchParams(query).get('tab');
  return SITE_TABS.some((item) => item.id === requested) ? (requested as Kind) : 'team';
};

const siteErrorMessage = (reason: unknown) => {
  if (reason instanceof Error && reason.message === 'forbidden') {
    return 'У вас нет прав для редактирования или публикации этого раздела.';
  }
  if (reason instanceof Error && reason.message === 'rev_conflict') {
    return 'Черновик изменился в другой вкладке. Перезагрузите данные перед сохранением.';
  }
  if (reason instanceof Error && reason.message === 'site_content_load_failed') {
    return 'Не удалось загрузить раздел «Сайт». Повторите попытку.';
  }
  return 'Не удалось сохранить изменения. Повторите попытку.';
};

const SitePage = () => {
  const [tab, setTab] = useState<Kind>(tabFromHash);
  const [documents, setDocuments] = useState<Partial<Record<Kind, SiteContentDocument>>>({});
  const [revisions, setRevisions] = useState<Partial<Record<Kind, number>>>({});
  const [status, setStatus] = useState<Partial<Record<Kind, TabStatus>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadErrors, setLoadErrors] = useState<LoadErrors>({});
  const [reloadToken, setReloadToken] = useState(0);
  const [mediaConversion, setMediaConversion] = useState<{
    file: File;
    memberId: string;
    progress: number;
    error: 'conversion' | 'upload' | null;
  } | null>(null);
  const documentsRef = useRef(documents);
  const revisionsRef = useRef(revisions);
  const statusRef = useRef(status);
  const tabRef = useRef(tab);
  documentsRef.current = documents;
  revisionsRef.current = revisions;
  statusRef.current = status;
  tabRef.current = tab;

  const document = documents[tab];
  const isSaving = status[tab] === 'saving';
  const isDirty = status[tab] === 'dirty';

  const loadKinds = useCallback((kinds: Kind[], force: boolean) => {
    const toLoad = kinds.filter((kind) => force || documentsRef.current[kind] == null);
    if (toLoad.length === 0) return () => undefined;
    let alive = true;
    void Promise.all(
      toLoad.map(async (kind) => {
        try {
          return { kind, result: await adminGetSiteContent(kind) };
        } catch (reason: unknown) {
          return {
            kind,
            error: reason instanceof Error ? reason.message : 'site_content_load_failed',
          };
        }
      }),
    ).then((items) => {
      if (!alive) return;
      const fulfilled = items.filter(
        (item): item is { kind: Kind; result: Awaited<ReturnType<typeof adminGetSiteContent>> } =>
          'result' in item,
      );
      setDocuments((current) => ({
        ...current,
        ...Object.fromEntries(fulfilled.map(({ kind, result }) => [kind, result.document])),
      }));
      setRevisions((current) => ({
        ...current,
        ...Object.fromEntries(fulfilled.map(({ kind, result }) => [kind, result.meta.rev])),
      }));
      setStatus((current) => ({
        ...current,
        ...Object.fromEntries(fulfilled.map(({ kind }) => [kind, 'saved' as const])),
      }));
      setLoadErrors((current) => ({
        ...current,
        ...Object.fromEntries(
          items
            .map(({ kind, error: itemError }) => [kind, itemError] as const)
            .filter((entry): entry is readonly [Kind, string] => entry[1] != null),
        ),
      }));
      const currentTab = tabRef.current;
      const primaryError = items.find((item) => item.kind === currentTab && 'error' in item)?.error;
      setError(primaryError ? siteErrorMessage(new Error(primaryError)) : null);
      if (primaryError) setStatus((current) => ({ ...current, [currentTab]: 'error' }));
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const kinds: Kind[] = tab === 'modal' ? ['modal', 'contacts'] : [tab];
    return loadKinds(kinds, false);
  }, [loadKinds, tab]);

  useEffect(() => {
    if (reloadToken === 0) return;
    return loadKinds([tabRef.current], true);
  }, [loadKinds, reloadToken]);

  const setDocument = (next: SiteContentDocument) => {
    setDocuments((current) => ({ ...current, [tab]: next }));
    setStatus((current) => ({ ...current, [tab]: 'dirty' }));
  };

  const persist = useCallback(async (kind: Kind, publish = false) => {
    const currentDocument = documentsRef.current[kind];
    const currentRev = revisionsRef.current[kind];
    if (currentDocument == null || currentRev == null) return;
    if (!publish) {
      const blocker = siteContentBlocker(currentDocument);
      if (blocker != null) {
        setError(blocker);
        return;
      }
    }
    setStatus((current) => ({ ...current, [kind]: 'saving' }));
    try {
      const result = publish
        ? await adminPublishSiteContent(kind, currentRev)
        : await adminSaveSiteContent(kind, currentRev, currentDocument);
      setDocuments((current) => ({ ...current, [kind]: result.document }));
      setRevisions((current) => ({ ...current, [kind]: result.meta.rev }));
      setStatus((current) => ({ ...current, [kind]: publish ? 'published' : 'saved' }));
      setError(null);
    } catch (reason: unknown) {
      setError(siteErrorMessage(reason));
      setStatus((current) => ({ ...current, [kind]: 'error' }));
    }
  }, []);

  useAdminAutosave({
    enabled: isDirty && !isSaving,
    snapshot: document == null ? '' : JSON.stringify(document),
    save: () => persist(tab),
  });

  useEffect(() => {
    const hasDirty = Object.values(status).some((item) => item === 'dirty');
    if (!hasDirty) return;
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ADMIN_UI.unsaved;
    };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [status]);

  const uploadTeamPhoto = async (memberId: string, file: File) => {
    if (!isSiteContentImageFile(file)) {
      setError(ADMIN_UI.sitePhotoFormatError);
      return;
    }
    const heic = isHeicCmsFile(file);
    const currentTeam = documentsRef.current.team;
    const member = currentTeam?.kind === 'team'
      ? currentTeam.members.find((item) => item.id === memberId)
      : undefined;
    const alt = member?.photo.alt.trim() || member?.name || '';
    try {
      if (heic) {
        setMediaConversion({ file, memberId, progress: 15, error: null });
      }
      const result = await adminUploadSiteAsset('team', file, alt);
      const team = documentsRef.current.team;
      if (team?.kind === 'team') {
        setDocuments((current) => ({
          ...current,
          team: {
            ...team,
            members: team.members.map((item) =>
              item.id === memberId ? { ...item, photo: result.asset } : item,
            ),
          },
        }));
        setStatus((current) => ({ ...current, team: 'dirty' }));
        setError(null);
      }
      if (heic) {
        setMediaConversion({ file, memberId, progress: 100, error: null });
        window.setTimeout(() => setMediaConversion(null), 250);
      }
    } catch (reason: unknown) {
      if (heic) {
        setMediaConversion({
          file,
          memberId,
          progress: 40,
          error: reason instanceof Error && reason.message === 'heic_conversion_failed' ? 'conversion' : 'upload',
        });
        return;
      }
      setError(siteErrorMessage(reason));
    }
  };

  const uploadFooterPdf = async (blockId: string, rowId: string, file: File) => {
    if (!isSiteContentPdfFile(file)) {
      setError(ADMIN_UI.sitePdfRequired);
      return;
    }
    try {
      const result = await adminUploadSiteAsset('footer', file);
      const footer = documentsRef.current.footer;
      if (footer?.kind !== 'footer') return;
      setDocuments((current) => ({
        ...current,
        footer: {
          ...footer,
          blocks: footer.blocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  rows: block.rows.map((row) =>
                    row.id === rowId && row.type === 'pdf'
                      ? {
                          ...row,
                          documentId: result.asset.assetId,
                          asset: result.asset,
                          value: row.value.length > 0 ? row.value : file.name,
                        }
                      : row,
                  ),
                }
              : block,
          ),
        },
      }));
      setStatus((current) => ({ ...current, footer: 'dirty' }));
      setError(null);
    } catch (reason: unknown) {
      setError(siteErrorMessage(reason));
    }
  };

  const selectTab = (next: Kind) => {
    const current = tabRef.current;
    if (statusRef.current[current] === 'dirty') {
      void persist(current);
    }
    setTab(next);
    setError(null);
    const nextHash = `#/site?tab=${next}`;
    if (location.hash !== nextHash) history.replaceState(null, '', nextHash);
  };

  const tabStatus = status[tab];
  const statusLabel =
    tabStatus === 'published'
      ? ADMIN_UI.tourStatus.active
      : tabStatus === 'dirty'
        ? ADMIN_UI.unsaved
        : tabStatus === 'saved'
          ? ADMIN_UI.autosaved
          : tabStatus === 'saving'
            ? ADMIN_UI.saving
            : '';
  const statusTone =
    tabStatus === 'published' ? 'success' : tabStatus === 'dirty' ? 'warning' : tabStatus === 'error' ? 'danger' : 'draft';
  const saveHint =
    isSaving ? ADMIN_UI.saving : isDirty ? ADMIN_UI.unsaved : tabStatus === 'saved' ? ADMIN_UI.saved : null;
  const publishHint = isDirty || isSaving ? ADMIN_UI.sitePublishHint : null;

  const content =
    document == null && error != null ? (
      <AdminErrorState title={ADMIN_UI.pageLoadError} description={error} onRetry={() => setReloadToken((current) => current + 1)} />
    ) : document == null ? (
      <AdminSkeleton variant="page" />
    ) : tab === 'team' ? (
      <SiteTeamTab value={document as TeamContentDocument} onChange={setDocument} onUpload={uploadTeamPhoto} />
    ) : tab === 'contacts' ? (
      <SiteContactsTab value={document as ContactsContentDocument} onChange={setDocument} />
    ) : tab === 'footer' ? (
      <SiteFooterTab
        value={document as FooterContentDocument}
        onChange={setDocument}
        onUploadPdf={uploadFooterPdf}
      />
    ) : (
      <SiteModalTab
        value={document as ModalContentDocument}
        onChange={setDocument}
        contacts={documents.contacts?.kind === 'contacts' ? documents.contacts : undefined}
        contactsError={loadErrors.contacts}
      />
    );

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageFrame variant="wide" density="compact" className="admin-sticky-editor">
        <AdminPageHeader
          title={ADMIN_UI.siteNav}
          description={ADMIN_UI.siteDescription}
          meta={
            statusLabel.length > 0 ? (
              <AdminStatus level="primary" tone={statusTone}>
                {statusLabel}
              </AdminStatus>
            ) : null
          }
          toolbar={
            <SiteSectionTabs
              label={ADMIN_UI.siteTabs}
              value={tab}
              options={SITE_TABS}
              onChange={selectTab}
            />
          }
        />
        {error != null && document != null ? <AdminAlert tone="danger">{error}</AdminAlert> : null}
        <div className="flex min-w-0 flex-col gap-3 pb-24 md:pb-28">{content}</div>
      </AdminPageFrame>
      <AdminStickyContextBar
        entityState={
          statusLabel.length > 0 ? (
            <AdminStatus level="primary" tone={statusTone}>
              {statusLabel}
            </AdminStatus>
          ) : null
        }
        saveHint={saveHint}
        disabledHint={publishHint}
        secondary={
          <AdminButton
            variant="secondary"
            aria-busy={isSaving}
            disabled={document == null || isSaving}
            onClick={() => void persist(tab)}
          >
            <Save size={16} aria-hidden="true" />
            {isSaving ? ADMIN_UI.saving : ADMIN_UI.siteSaveDraft}
          </AdminButton>
        }
        primary={
          <AdminButton
            variant="publish"
            aria-busy={isSaving}
            disabled={document == null || isSaving || isDirty}
            aria-describedby={publishHint != null ? 'admin-sticky-disabled-hint' : undefined}
            onClick={() => void persist(tab, true)}
          >
            <UploadCloud size={16} aria-hidden="true" />
            {isSaving ? ADMIN_UI.publishing : ADMIN_UI.sitePublish}
          </AdminButton>
        }
      />
      <MediaConversionModal
        open={mediaConversion != null}
        progress={mediaConversion?.progress ?? 0}
        error={mediaConversion?.error}
        onRetry={
          mediaConversion != null
            ? () => void uploadTeamPhoto(mediaConversion.memberId, mediaConversion.file)
            : undefined
        }
        onClose={() => setMediaConversion(null)}
      />
    </div>
  );
};

export default SitePage;
