import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { ADMIN_PATHS } from './constants/routes';
import { slugFromTitle } from '../cms/cmsTourSlug';
import { adminCreateDeparture, adminDeleteTourAsset, adminGetTour, adminListDepartures, adminPublishTour, adminSaveTour, adminUploadTourAsset, type AdminSession } from './api';
import { invalidateAdminDepartures, invalidateAdminPublishQueue, invalidateAdminTours, refreshAdminTours } from './adminDataCache';
import type { CmsTourLayoutPatch } from '../cms/applyTourLayoutPatch';
import type { CmsTourTextPatch } from '../cms/applyTourTextPatch';
import { cmsPublishBlockersForIntent, CMS_PUBLISH_BLOCKERS, type CmsPublishBlocker } from '../cms/cmsPublishRules';
import type { CmsTourDocument } from '../cms/cmsTourDocument';
import { cmsTourCoverUrl } from '../cms/cmsTourCoverUrl';
import { tourSectionCompletion } from '../cms/tourCompleteness';
import type { CmsTourMeta } from '../cms/cmsTourMeta';
import AddDepartureWizard from './components/AddDepartureWizard';
import AboutSection from './components/AboutSection';
import AdminAlert, { type AdminAlertTone } from './components/AdminAlert';
import AdminButton from './components/AdminButton';
import AdminConfirmDialog from './components/AdminConfirmDialog';
import AdminEditorSectionTabs from './components/AdminEditorSectionTabs';
import AdminErrorState from './components/AdminErrorState';
import AdminPageFrame from './components/AdminPageFrame';
import AdminPageHeader from './components/AdminPageHeader';
import AdminSheet from './components/AdminSheet';
import AdminSkeleton from './components/AdminSkeleton';
import AdminStatus from './components/AdminStatus';
import AdminStickyContextBar from './components/AdminStickyContextBar';
import BentoSection from './components/BentoSection';
import IncludedSection from './components/IncludedSection';
import ProgramSection from './components/ProgramSection';
import TourCatalogFields from './components/TourCatalogFields';
import TourIdentityFields from './components/TourIdentityFields';
import AdminReadinessRing from './components/AdminReadinessRing';
import { ADMIN_UI } from './constants/ui';
import { formatAdminReadiness } from './formatAdminCopy';
import { useAdminAutosave } from './hooks/useAdminAutosave';
import { useAdminViewport } from './hooks/useAdminViewport';
import {
  layoutFromDocument,
  patchFromDocument,
  storedTextPatchFromDocument,
} from './patchFromDocument';
import { adminTourHasPublicPage, adminTourPublicHref } from './adminTourPublicHref';
import { adminTourLiveVisibility, adminTourLiveVisibilityTone } from './tourLiveVisibility';
import { prepareCmsUploads } from './prepareCmsUploads';
import {
  ATTENTION_TAB_QUERY,
  EDITOR_SECTION_NAV,
  blockerFocusId,
  blockerSectionId,
  firstAttentionSectionId,
  parseEditorTabParam,
  sectionTabQuery,
  tabBlockerSectionIds,
  type AdminEditorSectionId,
} from './tourEditorTabs';

const EMPTY_PATCH: CmsTourTextPatch = {
  title: '',
  slug: '',
  subtitle: '',
  heroPhrase: '',
  duration: '',
  durationDays: undefined,
  difficulty: 'Medium',
  difficultyDisplayLabel: '',
  metaAudienceLabel: '',
  price: '',
  pricePrevious: '',
  priceFootnote: '',
  seoDescription: '',
  description: '',
  descriptionLeadBold: '',
  descriptionAside: '',
  prefaceAssetId: null,
  included: [],
  program: [],
  programAdditionalNotes: [],
  assetAlts: {},
};

const EMPTY_LAYOUT: CmsTourLayoutPatch = {
  coverAssetId: null,
  coverCrop: {},
  bento: { blocks: [] },
};

function editorFeedbackTone(
  status:
    | 'conflict'
    | 'error'
    | 'uploadError'
    | 'deleteError'
    | 'deleteInUse'
    | 'published'
    | 'publishError'
    | 'hideHasLeads'
    | 'slugTaken'
    | 'invalidSlug'
    | CmsPublishBlocker,
): AdminAlertTone {
  if (status === 'published') {
    return 'success';
  }
  if (
    status === 'conflict' ||
    status === 'deleteInUse' ||
    (CMS_PUBLISH_BLOCKERS as readonly string[]).includes(status)
  ) {
    return 'warning';
  }
  return 'danger';
}

function editorSnapshot(
  patch: CmsTourTextPatch,
  layout: CmsTourLayoutPatch,
  status: CmsTourDocument['status'],
): string {
  return JSON.stringify({ patch, layout, status });
}

function editorTourDocument(
  document: CmsTourDocument,
  patch: CmsTourTextPatch,
  layout: CmsTourLayoutPatch,
): CmsTourDocument {
  return {
    ...document,
    title: patch.title ?? document.title,
    slug: patch.slug ?? document.slug,
    subtitle: patch.subtitle ?? document.subtitle,
    heroPhrase: patch.heroPhrase ?? document.heroPhrase,
    duration: patch.duration ?? document.duration,
    durationDays: patch.durationDays ?? document.durationDays,
    difficulty: patch.difficulty ?? document.difficulty,
    price: patch.price ?? document.price,
    description: patch.description,
    descriptionAside: patch.descriptionAside,
    included: patch.included,
    program: patch.program,
    coverAssetId: layout.coverAssetId,
    prefaceAssetId: patch.prefaceAssetId,
    bento: layout.bento,
    ...(layout.coverCrop != null ? { coverCrop: layout.coverCrop } : {}),
  };
}

const TourEditorPage = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const { session } = useOutletContext<{ session: AdminSession }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewport = useAdminViewport();
  const [document, setDocument] = useState<CmsTourDocument | null>(null);
  const [meta, setMeta] = useState<CmsTourMeta | null>(null);
  const [published, setPublished] = useState(false);
  const [publishedStatus, setPublishedStatus] = useState<CmsTourDocument['status'] | null>(null);
  const [hideDeparturesConfirm, setHideDeparturesConfirm] = useState(false);
  const [patch, setPatch] = useState<CmsTourTextPatch>(EMPTY_PATCH);
  const [layout, setLayout] = useState<CmsTourLayoutPatch>(EMPTY_LAYOUT);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [addDepartureOpen, setAddDepartureOpen] = useState(false);
  const [problemsOpen, setProblemsOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [status, setStatus] = useState<
    | 'saved'
    | 'conflict'
    | 'error'
    | 'uploadError'
    | 'deleteError'
    | 'deleteInUse'
    | 'published'
    | 'publishError'
    | 'hideHasLeads'
    | 'slugTaken'
    | 'invalidSlug'
    | CmsPublishBlocker
    | null
  >(null);
  const documentRef = useRef(document);
  const metaRef = useRef(meta);
  const patchRef = useRef(patch);
  const layoutRef = useRef(layout);
  const savedSnapshotRef = useRef(savedSnapshot);
  documentRef.current = document;
  metaRef.current = meta;
  patchRef.current = patch;
  layoutRef.current = layout;
  savedSnapshotRef.current = savedSnapshot;

  useEffect(() => {
    if (tourId == null) {
      setDocument(null);
      setMeta(null);
      return;
    }
    let cancelled = false;
    setDocument(null);
    setMeta(null);
    setLoadError(false);
    setStatus(null);
    void adminGetTour(tourId)
      .then((payload) => {
        if (cancelled) return;
        const nextPatch = patchFromDocument(payload.document);
        const nextLayout = layoutFromDocument(payload.document);
        setDocument(payload.document);
        setMeta(payload.meta);
        setPublished(payload.published);
        setPublishedStatus(payload.publishedStatus ?? null);
        setPatch(nextPatch);
        setLayout(nextLayout);
        // Снимок без автосплита: если колонки только что разложились, черновик dirty и автосейв запишет их в CMS.
        setSavedSnapshot(
          editorSnapshot(
            storedTextPatchFromDocument(payload.document),
            nextLayout,
            payload.document.status,
          ),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setDocument(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tourId, reloadToken]);

  const dirty = useMemo(
    () =>
      document != null && editorSnapshot(patch, layout, document.status) !== savedSnapshot,
    [document, patch, layout, savedSnapshot]
  );

  const publishBlockers = useMemo(() => {
    if (document == null) {
      return [];
    }
    return cmsPublishBlockersForIntent(editorTourDocument(document, patch, layout), {
      hasPublishedSnapshot: published,
    });
  }, [document, layout, patch, published]);

  const sectionCompletion = useMemo(() => {
    if (document == null) {
      return null;
    }
    return tourSectionCompletion(editorTourDocument(document, patch, layout));
  }, [document, layout, patch]);

  const tabParam = parseEditorTabParam(searchParams.get('tab'));
  const [activeSection, setActiveSection] = useState<AdminEditorSectionId>(
    tabParam === ATTENTION_TAB_QUERY ? 'admin-catalog' : tabParam,
  );

  useEffect(() => {
    if (sectionCompletion == null) {
      return;
    }
    if (tabParam === ATTENTION_TAB_QUERY) {
      const next = firstAttentionSectionId(publishBlockers, sectionCompletion);
      setActiveSection(next);
      setSearchParams({ tab: sectionTabQuery(next) }, { replace: true });
      return;
    }
    setActiveSection(tabParam);
  }, [publishBlockers, sectionCompletion, setSearchParams, tabParam]);

  useEffect(() => {
    if (!dirty) {
      return;
    }
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ADMIN_UI.unsaved;
    };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [dirty]);

  const persistDraft = useCallback(async (): Promise<{
    document: CmsTourDocument;
    meta: CmsTourMeta;
  } | null> => {
    const currentDocument = documentRef.current;
    const currentMeta = metaRef.current;
    const currentPatch = patchRef.current;
    const currentLayout = layoutRef.current;
    if (currentDocument == null || currentMeta == null) {
      return null;
    }
    const snapshotAtStart = editorSnapshot(
      currentPatch,
      currentLayout,
      currentDocument.status,
    );
    setSaving(true);
    setStatus(null);
    try {
      const payload = await adminSaveTour(
        currentDocument.id,
        currentMeta.rev,
        currentPatch,
        currentLayout,
        currentDocument.status,
      );
      invalidateAdminTours();
      invalidateAdminPublishQueue();
      const latestSnapshot = editorSnapshot(
        patchRef.current,
        layoutRef.current,
        documentRef.current?.status ?? currentDocument.status,
      );
      documentRef.current = payload.document;
      metaRef.current = payload.meta;
      setDocument(payload.document);
      setMeta(payload.meta);
      if (latestSnapshot !== snapshotAtStart) {
        return payload;
      }
      const nextPatch = patchFromDocument(payload.document);
      const nextLayout = layoutFromDocument(payload.document);
      const nextSnapshot = editorSnapshot(nextPatch, nextLayout, payload.document.status);
      setPatch(nextPatch);
      setLayout(nextLayout);
      savedSnapshotRef.current = nextSnapshot;
      setSavedSnapshot(nextSnapshot);
      setStatus('saved');
      return payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'save_failed';
      setStatus(
        message === 'rev_conflict'
          ? 'conflict'
          : message === 'slug_taken'
            ? 'slugTaken'
            : message === 'invalid_slug'
              ? 'invalidSlug'
              : 'error',
      );
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const draftIsDirty = useCallback(() => {
    const currentDocument = documentRef.current;
    if (currentDocument == null) {
      return false;
    }
    return (
      editorSnapshot(patchRef.current, layoutRef.current, currentDocument.status) !==
      savedSnapshotRef.current
    );
  }, []);

  const flushDraft = useCallback(async () => {
    while (draftIsDirty()) {
      const saved = await persistDraft();
      if (saved == null) {
        return null;
      }
    }
    const currentDocument = documentRef.current;
    const currentMeta = metaRef.current;
    if (currentDocument == null || currentMeta == null) {
      return null;
    }
    return { document: currentDocument, meta: currentMeta };
  }, [draftIsDirty, persistDraft]);

  const onSave = useCallback(async () => {
    await persistDraft();
  }, [persistDraft]);

  useAdminAutosave({
    enabled:
      dirty &&
      !saving &&
      !uploading &&
      !publishing &&
      status !== 'conflict' &&
      status !== 'slugTaken' &&
      status !== 'invalidSlug',
    snapshot: editorSnapshot(patch, layout, document?.status ?? 'draft'),
    save: onSave,
  });

  if (tourId == null) {
    return <Navigate to="/" replace />;
  }

  if (loadError) {
    return (
      <AdminPageFrame variant="wide">
        <AdminErrorState
          title={ADMIN_UI.loadError}
          onRetry={() => {
            setLoadError(false);
            setReloadToken((current) => current + 1);
          }}
        />
      </AdminPageFrame>
    );
  }

  if (document == null || meta == null) {
    return (
      <AdminPageFrame variant="wide">
        <AdminSkeleton variant="page" />
      </AdminPageFrame>
    );
  }

  const uploadFiles = async (files: File[]) => {
    const prepared = await prepareCmsUploads(files);
    if (prepared.length === 0) {
      throw new Error('upload_failed');
    }
    setUploading(true);
    setStatus(null);
    try {
      let rev = meta.rev;
      let nextDocument = document;
      let nextMeta = meta;
      const assetIds: string[] = [];
      for (const item of prepared) {
        const payload = await adminUploadTourAsset(
          nextDocument.id,
          rev,
          item.still,
          item.video,
          (patch.title ?? document.title).trim(),
        );
        rev = payload.meta.rev;
        nextDocument = payload.document;
        nextMeta = payload.meta;
        assetIds.push(payload.assetId);
      }
      setDocument(nextDocument);
      setMeta(nextMeta);
      invalidateAdminTours();
      invalidateAdminPublishQueue();
      setPatch((current) => ({
        ...current,
        assetAlts: {
          ...Object.fromEntries(nextDocument.assets.map((asset) => [asset.id, asset.alt])),
          ...current.assetAlts,
        },
      }));
      return { document: nextDocument, assetIds };
    } catch (error) {
      setStatus(
        error instanceof Error && error.message === 'rev_conflict' ? 'conflict' : 'uploadError'
      );
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const onPoolFiles = async (files: File[]) => {
    await uploadFiles(files);
  };

  const onCoverFiles = async (files: File[]) => {
    const payload = await uploadFiles(files);
    const coverId = payload.assetIds[0];
    if (coverId != null) {
      setLayout((current) => ({ ...current, coverAssetId: coverId }));
    }
  };

  const onPrefaceFiles = async (files: File[]) => {
    const payload = await uploadFiles(files);
    const prefaceId = payload.assetIds[0];
    if (prefaceId != null) {
      setPatch((current) => ({ ...current, prefaceAssetId: prefaceId }));
    }
  };

  const onDeleteAsset = async (assetId: string) => {
    setUploading(true);
    setStatus(null);
    try {
      let rev = meta.rev;
      if (dirty) {
        const saved = await adminSaveTour(document.id, meta.rev, patch, layout, document.status);
        invalidateAdminTours();
        invalidateAdminPublishQueue();
        setDocument(saved.document);
        setMeta(saved.meta);
        setSavedSnapshot(editorSnapshot(patch, layout, saved.document.status));
        rev = saved.meta.rev;
      }
      const payload = await adminDeleteTourAsset(document.id, rev, assetId);
      invalidateAdminTours();
      invalidateAdminPublishQueue();
      setDocument(payload.document);
      setMeta(payload.meta);
    } catch (error) {
      if (error instanceof Error && error.message === 'rev_conflict') {
        setStatus('conflict');
      } else if (error instanceof Error && error.message === 'asset_in_use') {
        setStatus('deleteInUse');
      } else {
        setStatus('deleteError');
      }
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const onPublish = async (confirmDeleteFutureDepartures = false) => {
    setPublishing(true);
    setStatus(null);
    try {
      const flushed = await flushDraft();
      if (flushed == null) {
        return;
      }
      const payload = await adminPublishTour(flushed.document.id, flushed.meta.rev, {
        confirmDeleteFutureDepartures,
      });
      invalidateAdminTours();
      invalidateAdminPublishQueue();
      void refreshAdminTours();
      documentRef.current = payload.document;
      metaRef.current = payload.meta;
      setDocument(payload.document);
      setMeta(payload.meta);
      setPublished(true);
      setPublishedStatus(payload.document.status);
      const nextSnapshot = editorSnapshot(
        patchRef.current,
        layoutRef.current,
        payload.document.status,
      );
      savedSnapshotRef.current = nextSnapshot;
      setSavedSnapshot(nextSnapshot);
      setStatus('published');
      setHideDeparturesConfirm(false);
    } catch (error) {
      if (error instanceof Error && error.message === 'rev_conflict') {
        setStatus('conflict');
      } else if (error instanceof Error && error.message === 'confirm_delete_future_departures') {
        setHideDeparturesConfirm(true);
      } else if (error instanceof Error && error.message === 'future_departures_have_leads') {
        setStatus('hideHasLeads');
      } else if (
        error instanceof Error &&
        (CMS_PUBLISH_BLOCKERS as readonly string[]).includes(error.message)
      ) {
        setStatus(error.message as CmsPublishBlocker);
      } else {
        setStatus('publishError');
      }
    } finally {
      setPublishing(false);
    }
  };

  const selectSection = (sectionId: AdminEditorSectionId, focusId?: string) => {
    setActiveSection(sectionId);
    setSearchParams({ tab: sectionTabQuery(sectionId) }, { replace: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.requestAnimationFrame(() => {
      if (focusId != null) {
        const node = window.document.getElementById(focusId);
        node?.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'center',
        });
        if (node instanceof HTMLElement) {
          node.focus();
        }
        return;
      }
      window.document.getElementById('admin-main')?.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    });
  };

  const statusMessage =
    status === 'published'
      ? ADMIN_UI.published
      : status === 'conflict'
          ? ADMIN_UI.conflict
          : status === 'error'
            ? ADMIN_UI.saveError
            : status === 'uploadError'
              ? ADMIN_UI.uploadError
              : status === 'deleteError'
                ? ADMIN_UI.deleteError
                : status === 'deleteInUse'
                  ? ADMIN_UI.deleteInUse
                  : status === 'publishError'
                    ? ADMIN_UI.publishError
                    : status === 'hideHasLeads'
                      ? ADMIN_UI.publishHideHasLeads
                      : status === 'slugTaken'
                      ? ADMIN_UI.slugTaken
                      : status === 'invalidSlug'
                        ? ADMIN_UI.invalidSlug
                        : status != null &&
                            status !== 'saved' &&
                            (CMS_PUBLISH_BLOCKERS as readonly string[]).includes(status)
                      ? ADMIN_UI.publishBlockers[status]
                      : null;

  const autosaveHint = saving
    ? ADMIN_UI.saving
    : dirty
      ? ADMIN_UI.unsaved
      : status === 'saved'
        ? published
          ? ADMIN_UI.unpublishedChanges
          : ADMIN_UI.autosaved
        : null;

  const editorTitle = patch.title ?? document.title;
  const guestVisibility = adminTourLiveVisibility({
    published,
    status: document.status,
    publishedStatus,
  });
  const publicHref = adminTourHasPublicPage({
    published,
    status: document.status,
    publishedStatus,
  })
    ? adminTourPublicHref({
        id: document.id,
        season: document.season,
        slug: patch.slug ?? document.slug,
      })
    : undefined;
  const readyCount =
    sectionCompletion == null ? 0 : Object.values(sectionCompletion).filter(Boolean).length;
  const readyTotal = sectionCompletion == null ? 0 : Object.keys(sectionCompletion).length;
  const readinessLabel =
    sectionCompletion == null ? undefined : formatAdminReadiness(readyCount, readyTotal);
  const publishDisabledHint =
    publishBlockers.length > 0 ? ADMIN_UI.publishBlockers.tour_not_ready : null;

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageFrame variant="wide" density="compact">
        <div className="flex flex-col gap-2">
        <Link
          to={ADMIN_PATHS.season(document.season)}
          className="inline-flex min-h-11 w-fit items-center rounded-admin-control px-2 text-sm no-underline admin-nav-item"
        >
          {ADMIN_UI.backToSeasonTours}
        </Link>
        <AdminPageHeader
          title={editorTitle}
          meta={
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatus level="primary" tone={adminTourLiveVisibilityTone(guestVisibility)}>
                {ADMIN_UI.tourLiveVisibility[guestVisibility]}
              </AdminStatus>
            </div>
          }
          secondary={
            <>
              {sectionCompletion != null ? (
                <AdminReadinessRing ready={readyCount} total={readyTotal} />
              ) : null}
              {publicHref != null ? (
              <a
                href={publicHref}
                target="_blank"
                rel="noreferrer"
                className="admin-btn-ghost no-underline"
              >
                {ADMIN_UI.tourPreviewAsGuest}
              </a>
            ) : null}
            </>
          }
          action={
            viewport === 'desktop' ? (
              <AdminButton
                variant="secondary"
                className="shrink-0"
                onClick={() => setAddDepartureOpen(true)}
              >
                {ADMIN_UI.scheduleAddFromTour}
              </AdminButton>
            ) : null
          }
          toolbar={
            <AdminEditorSectionTabs
              label={ADMIN_UI.editorSections}
              value={activeSection}
              options={EDITOR_SECTION_NAV}
              blockerIds={
                sectionCompletion == null
                  ? []
                  : tabBlockerSectionIds(publishBlockers, sectionCompletion)
              }
              onChange={(id) => selectSection(id)}
            />
          }
        />
        </div>
        <div className="flex min-w-0 flex-col gap-3 pb-28">
        <div
          role="tabpanel"
          id="admin-panel-admin-catalog"
          aria-labelledby="admin-tab-admin-catalog"
          hidden={activeSection !== 'admin-catalog'}
          inert={activeSection !== 'admin-catalog' ? true : undefined}
        >
          <div
            data-testid="admin-catalog-grid"
            className="grid gap-3 xl:grid-cols-2 xl:items-start"
          >
            <TourIdentityFields
              className="xl:row-span-2"
              title={patch.title ?? document.title}
              slug={patch.slug ?? document.slug}
              season={document.season}
              status={document.status}
              publicHref={publicHref}
              onTitle={(title) => setPatch((current) => ({ ...current, title }))}
              onSlug={(slug) => setPatch((current) => ({ ...current, slug }))}
              onStatus={(nextStatus) =>
                setDocument((current) => (current == null ? current : { ...current, status: nextStatus }))
              }
              onRegenerateSlug={() =>
                setPatch((current) => ({
                  ...current,
                  slug: slugFromTitle(current.title ?? document.title),
                }))
              }
            />
            <TourCatalogFields
              subtitle={patch.subtitle ?? ''}
              durationDays={patch.durationDays ?? document.durationDays}
              difficulty={patch.difficulty ?? document.difficulty}
              difficultyDisplayLabel={patch.difficultyDisplayLabel ?? ''}
              metaAudienceLabel={patch.metaAudienceLabel ?? ''}
              price={patch.price ?? ''}
              pricePrevious={patch.pricePrevious ?? ''}
              priceFootnote={patch.priceFootnote ?? ''}
              seoDescription={patch.seoDescription ?? ''}
              onChange={(next) => setPatch((current) => ({ ...current, ...next }))}
            />
          </div>
        </div>
        <div
          role="tabpanel"
          id="admin-panel-admin-about"
          aria-labelledby="admin-tab-admin-about"
          hidden={activeSection !== 'admin-about'}
          inert={activeSection !== 'admin-about' ? true : undefined}
        >
          <AboutSection
            document={document}
            description={patch.description}
            descriptionLeadBold={patch.descriptionLeadBold ?? ''}
            descriptionAside={patch.descriptionAside ?? ''}
            coverAssetId={layout.coverAssetId}
            prefaceAssetId={patch.prefaceAssetId}
            uploading={uploading}
            onDescription={(value) => setPatch((current) => ({ ...current, description: value }))}
            onLead={(value) => setPatch((current) => ({ ...current, descriptionLeadBold: value }))}
            onAside={(value) => setPatch((current) => ({ ...current, descriptionAside: value }))}
            onCoverFiles={(files) => void onCoverFiles(files)}
            onPrefaceFiles={(files) => void onPrefaceFiles(files)}
            coverCrop={layout.coverCrop ?? {}}
            onCoverCrop={(coverCrop) => setLayout((current) => ({ ...current, coverCrop }))}
            heroPhrase={patch.heroPhrase ?? ''}
            onHeroPhrase={(value) => setPatch((current) => ({ ...current, heroPhrase: value }))}
          />
        </div>
        <div
          role="tabpanel"
          id="admin-panel-admin-included"
          aria-labelledby="admin-tab-admin-included"
          hidden={activeSection !== 'admin-included'}
          inert={activeSection !== 'admin-included' ? true : undefined}
        >
          <IncludedSection
            items={patch.included}
            onChange={(included) => setPatch((current) => ({ ...current, included }))}
          />
        </div>
        <div
          role="tabpanel"
          id="admin-panel-admin-program"
          aria-labelledby="admin-tab-admin-program"
          hidden={activeSection !== 'admin-program'}
          inert={activeSection !== 'admin-program' ? true : undefined}
        >
          <ProgramSection
            program={patch.program}
            notes={patch.programAdditionalNotes ?? []}
            onProgram={(program) => setPatch((current) => ({ ...current, program }))}
            onNotes={(programAdditionalNotes) =>
              setPatch((current) => ({ ...current, programAdditionalNotes }))
            }
          />
        </div>
        <div
          role="tabpanel"
          id="admin-panel-admin-gallery"
          aria-labelledby="admin-tab-admin-gallery"
          hidden={activeSection !== 'admin-gallery'}
          inert={activeSection !== 'admin-gallery' ? true : undefined}
        >
          <BentoSection
            document={document}
            coverAssetId={layout.coverAssetId}
            prefaceAssetId={patch.prefaceAssetId}
            bento={layout.bento}
            onBento={(bento) => setLayout((current) => ({ ...current, bento }))}
            onPoolFiles={onPoolFiles}
            onDeleteAsset={onDeleteAsset}
            uploading={uploading}
          />
        </div>
        </div>
      </AdminPageFrame>
      <AdminStickyContextBar
        readiness={readinessLabel}
        blockerCount={publishBlockers.length}
        saveHint={autosaveHint}
        disabledHint={publishDisabledHint}
        feedback={
          statusMessage != null && status != null && status !== 'saved' ? (
            <AdminAlert tone={editorFeedbackTone(status)}>{statusMessage}</AdminAlert>
          ) : null
        }
        onShowProblems={
          publishBlockers.length > 0 ? () => setProblemsOpen(true) : undefined
        }
        secondary={
          viewport !== 'desktop' ? (
            <AdminButton variant="secondary" onClick={() => setAddDepartureOpen(true)}>
              {ADMIN_UI.scheduleAddFromTour}
            </AdminButton>
          ) : undefined
        }
        primary={
          session.canPublishTours ? (
            <AdminButton
              disabled={saving || uploading || publishing || publishBlockers.length > 0}
              aria-describedby={publishDisabledHint != null ? 'admin-sticky-disabled-hint' : undefined}
              onClick={() => void onPublish()}
            >
              {publishing ? ADMIN_UI.publishing : ADMIN_UI.publish}
            </AdminButton>
          ) : (
            <Link to={ADMIN_PATHS.inbox} className="admin-btn-secondary no-underline">
              {ADMIN_UI.dashboardOpenInbox}
            </Link>
          )
        }
      />
      {problemsOpen ? (
        <AdminSheet
          title={ADMIN_UI.showProblems}
          titleId="admin-editor-blockers"
          closeLabel={ADMIN_UI.closeOverlay}
          onClose={() => setProblemsOpen(false)}
        >
          <ul className="flex flex-col gap-1">
            {publishBlockers.map((blocker) => (
              <li key={blocker}>
                <button
                  type="button"
                  className="admin-btn-ghost w-full justify-start"
                  onClick={() => {
                    if (sectionCompletion != null) {
                      const sectionId = blockerSectionId(blocker, sectionCompletion);
                      selectSection(
                        sectionId,
                        blockerFocusId(blocker, { included: patch.included }),
                      );
                    }
                    setProblemsOpen(false);
                  }}
                >
                  {ADMIN_UI.publishBlockers[blocker]}
                </button>
              </li>
            ))}
          </ul>
        </AdminSheet>
      ) : null}
      {hideDeparturesConfirm ? (
        <AdminConfirmDialog
          title={ADMIN_UI.publishHideConfirmTitle}
          description={ADMIN_UI.publishHideConfirmBody}
          confirmLabel={ADMIN_UI.publishHideConfirm}
          onConfirm={() => void onPublish(true)}
          onClose={() => setHideDeparturesConfirm(false)}
        />
      ) : null}
      {addDepartureOpen ? (
        <AddDepartureWizard
          pickableTours={[
            {
              id: document.id,
              title: editorTitle,
              season: document.season,
              imageUrl: cmsTourCoverUrl(document),
            },
          ]}
          lockedTourId={document.id}
          onClose={() => setAddDepartureOpen(false)}
          onComplete={(input) => {
            void (async () => {
              const listed = await adminListDepartures({
                from: input.startsOn,
                to: input.startsOn,
              });
              const existing = listed.find(
                (departure) =>
                  departure.tourId === input.tourId &&
                  departure.startsOn === input.startsOn &&
                  departure.status !== 'cancelled',
              );
              if (existing == null) {
                await adminCreateDeparture(input);
                invalidateAdminDepartures();
                invalidateAdminPublishQueue();
              }
              setAddDepartureOpen(false);
            })();
          }}
        />
      ) : null}
    </div>
  );
};

export default TourEditorPage;
