import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom';
import { ADMIN_PATHS } from './constants/routes';
import { slugFromTitle } from '../cms/cmsTourSlug';
import { adminDeleteTourAsset, adminGetTour, adminPublishTour, adminSaveTour, adminUploadTourAsset, type AdminSession } from './api';
import type { CmsTourLayoutPatch } from '../cms/applyTourLayoutPatch';
import type { CmsTourTextPatch } from '../cms/applyTourTextPatch';
import { cmsPublishBlockers, CMS_PUBLISH_BLOCKERS, type CmsPublishBlocker } from '../cms/cmsPublishRules';
import type { CmsTourDocument } from '../cms/cmsTourDocument';
import type { CmsTourMeta } from '../cms/cmsTourMeta';
import AboutSection from './components/AboutSection';
import AdminAlert, { type AdminAlertTone } from './components/AdminAlert';
import AdminBadge from './components/AdminBadge';
import AdminButton from './components/AdminButton';
import BentoSection from './components/BentoSection';
import IncludedSection from './components/IncludedSection';
import ProgramSection from './components/ProgramSection';
import TourCatalogFields from './components/TourCatalogFields';
import TourIdentityFields from './components/TourIdentityFields';
import { ADMIN_UI } from './constants/ui';
import { layoutFromDocument, patchFromDocument } from './patchFromDocument';
import { tourStatusTone } from './tourStatusAppearance';
import { prepareCmsUploads } from './prepareCmsUploads';
import { useAdminSectionSpy, type AdminEditorSectionId } from './useAdminSectionSpy';

const EMPTY_PATCH: CmsTourTextPatch = {
  title: '',
  slug: '',
  subtitle: '',
  heroPhrase: '',
  duration: '',
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
    | 'saved'
    | 'conflict'
    | 'error'
    | 'uploadError'
    | 'deleteError'
    | 'deleteInUse'
    | 'published'
    | 'publishError'
    | 'slugTaken'
    | 'invalidSlug'
    | CmsPublishBlocker,
): AdminAlertTone {
  if (status === 'saved' || status === 'published') {
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

const SECTION_NAV: Array<{ id: AdminEditorSectionId; label: string }> = [
  { id: 'admin-catalog', label: ADMIN_UI.sectionNav.catalog },
  { id: 'admin-about', label: ADMIN_UI.sectionNav.about },
  { id: 'admin-included', label: ADMIN_UI.sectionNav.included },
  { id: 'admin-program', label: ADMIN_UI.sectionNav.program },
  { id: 'admin-gallery', label: ADMIN_UI.sectionNav.gallery },
];

function editorSnapshot(patch: CmsTourTextPatch, layout: CmsTourLayoutPatch): string {
  return JSON.stringify({ patch, layout });
}

const TourEditorPage = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const { session } = useOutletContext<{ session: AdminSession }>();
  const [document, setDocument] = useState<CmsTourDocument | null>(null);
  const [meta, setMeta] = useState<CmsTourMeta | null>(null);
  const [patch, setPatch] = useState<CmsTourTextPatch>(EMPTY_PATCH);
  const [layout, setLayout] = useState<CmsTourLayoutPatch>(EMPTY_LAYOUT);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<
    | 'saved'
    | 'conflict'
    | 'error'
    | 'uploadError'
    | 'deleteError'
    | 'deleteInUse'
    | 'published'
    | 'publishError'
    | 'slugTaken'
    | 'invalidSlug'
    | CmsPublishBlocker
    | null
  >(null);

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
        setPatch(nextPatch);
        setLayout(nextLayout);
        setSavedSnapshot(editorSnapshot(nextPatch, nextLayout));
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
  }, [tourId]);

  const dirty = useMemo(
    () => document != null && editorSnapshot(patch, layout) !== savedSnapshot,
    [document, patch, layout, savedSnapshot]
  );

  const publishBlockers = useMemo(() => {
    if (document == null) {
      return [];
    }
    return cmsPublishBlockers({
      ...document,
      coverAssetId: layout.coverAssetId,
      prefaceAssetId: patch.prefaceAssetId,
      included: patch.included,
      bento: layout.bento,
    });
  }, [document, layout, patch]);

  const activeSection = useAdminSectionSpy(document != null && meta != null);

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

  if (tourId == null) {
    return <Navigate to="/" replace />;
  }

  if (loadError) {
    return <p className="p-6 text-difficulty-hard-fg">{ADMIN_UI.loadError}</p>;
  }

  if (document == null || meta == null) {
    return <p className="p-6 text-text-muted">{ADMIN_UI.loading}</p>;
  }

  const onSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const payload = await adminSaveTour(document.id, meta.rev, patch, layout);
      const nextPatch = patchFromDocument(payload.document);
      const nextLayout = layoutFromDocument(payload.document);
      setDocument(payload.document);
      setMeta(payload.meta);
      setPatch(nextPatch);
      setLayout(nextLayout);
      setSavedSnapshot(editorSnapshot(nextPatch, nextLayout));
      setStatus('saved');
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
    } finally {
      setSaving(false);
    }
  };

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
        const payload = await adminUploadTourAsset(nextDocument.id, rev, item.still, item.video, '');
        rev = payload.meta.rev;
        nextDocument = payload.document;
        nextMeta = payload.meta;
        assetIds.push(payload.assetId);
      }
      setDocument(nextDocument);
      setMeta(nextMeta);
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

  const onAssetAlt = (assetId: string, alt: string) => {
    setDocument((current) =>
      current == null
        ? current
        : {
            ...current,
            assets: current.assets.map((asset) =>
              asset.id === assetId ? { ...asset, alt } : asset
            ),
          }
    );
    setPatch((current) => ({
      ...current,
      assetAlts: { ...current.assetAlts, [assetId]: alt },
    }));
  };

  const onDeleteAsset = async (assetId: string) => {
    setUploading(true);
    setStatus(null);
    try {
      let rev = meta.rev;
      if (dirty) {
        const saved = await adminSaveTour(document.id, meta.rev, patch, layout);
        setDocument(saved.document);
        setMeta(saved.meta);
        setSavedSnapshot(editorSnapshot(patch, layout));
        rev = saved.meta.rev;
      }
      const payload = await adminDeleteTourAsset(document.id, rev, assetId);
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

  const onPublish = async () => {
    setPublishing(true);
    setStatus(null);
    try {
      const payload = await adminPublishTour(document.id, meta.rev);
      setDocument(payload.document);
      setMeta(payload.meta);
      setStatus('published');
    } catch (error) {
      if (error instanceof Error && error.message === 'rev_conflict') {
        setStatus('conflict');
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

  const scrollToSection = (sectionId: string) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.document.getElementById(sectionId)?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const statusMessage =
    status === 'saved'
      ? ADMIN_UI.saved
      : status === 'published'
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
                    : status === 'slugTaken'
                      ? ADMIN_UI.slugTaken
                      : status === 'invalidSlug'
                        ? ADMIN_UI.invalidSlug
                        : status != null && (CMS_PUBLISH_BLOCKERS as readonly string[]).includes(status)
                      ? ADMIN_UI.publishBlockers[status]
                      : null;

  const editorTitle = patch.title ?? document.title;

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-navbar z-season-dock flex flex-wrap items-center gap-2 border-b border-divider bg-surface-light px-4 py-1">
        <Link
          to={ADMIN_PATHS.season(document.season)}
          className="inline-flex min-h-11 items-center rounded-admin-control px-2 text-sm no-underline admin-nav-item"
        >
          {ADMIN_UI.backToSeasonTours}
        </Link>
        <h1 className="min-w-0 truncate text-sm font-semibold text-text-primary">{editorTitle}</h1>
        <AdminBadge tone={tourStatusTone(document.status)}>
          {ADMIN_UI.tourStatus[document.status]}
        </AdminBadge>
        <nav aria-label={ADMIN_UI.listTitle} className="flex flex-wrap gap-1">
          {SECTION_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`min-h-11 rounded-admin-control px-3 py-2 text-sm ${
                activeSection === item.id ? 'admin-nav-active' : 'admin-nav-item'
              }`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-4 p-4 pb-28">
        <section className="flex flex-col gap-3 rounded-card border border-divider bg-surface-light p-3">
          <TourIdentityFields
            title={patch.title ?? document.title}
            slug={patch.slug ?? document.slug}
            season={document.season}
            onTitle={(title) => setPatch((current) => ({ ...current, title }))}
            onSlug={(slug) => setPatch((current) => ({ ...current, slug }))}
            onRegenerateSlug={() =>
              setPatch((current) => ({
                ...current,
                slug: slugFromTitle(current.title ?? document.title),
              }))
            }
          />
        </section>
        <div id="admin-catalog">
          <TourCatalogFields
            subtitle={patch.subtitle ?? ''}
            heroPhrase={patch.heroPhrase ?? ''}
            duration={patch.duration ?? ''}
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
        <div id="admin-about">
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
          />
        </div>
        <div id="admin-included">
          <IncludedSection
            items={patch.included}
            onChange={(included) => setPatch((current) => ({ ...current, included }))}
          />
        </div>
        <div id="admin-program">
          <ProgramSection
            program={patch.program}
            notes={patch.programAdditionalNotes ?? []}
            onProgram={(program) => setPatch((current) => ({ ...current, program }))}
            onNotes={(programAdditionalNotes) =>
              setPatch((current) => ({ ...current, programAdditionalNotes }))
            }
          />
        </div>
        <div id="admin-gallery">
          <BentoSection
            document={document}
            coverAssetId={layout.coverAssetId}
            prefaceAssetId={patch.prefaceAssetId}
            bento={layout.bento}
            onBento={(bento) => setLayout((current) => ({ ...current, bento }))}
            onPoolFiles={onPoolFiles}
            onDeleteAsset={onDeleteAsset}
            onAssetAlt={onAssetAlt}
            uploading={uploading}
          />
        </div>
      </div>
      <div className="sticky bottom-0 z-season-dock flex items-center justify-between gap-4 border-t border-divider bg-surface-light px-4 py-2">
        <div className="flex min-w-0 flex-col gap-1">
          {statusMessage != null && status != null ? (
            <AdminAlert tone={editorFeedbackTone(status)}>{statusMessage}</AdminAlert>
          ) : null}
          {dirty ? <p className="text-sm text-text-muted">{ADMIN_UI.unsaved}</p> : null}
          {session.role === 'admin' && publishBlockers[0] != null ? (
            <AdminAlert tone="warning">{ADMIN_UI.publishBlockers[publishBlockers[0]]}</AdminAlert>
          ) : null}
        </div>
        <div className="flex gap-2">
          {session.role === 'admin' ? (
            <AdminButton
              variant="secondary"
              disabled={dirty || saving || uploading || publishing || publishBlockers.length > 0}
              onClick={() => void onPublish()}
            >
              {publishing ? ADMIN_UI.publishing : ADMIN_UI.publish}
            </AdminButton>
          ) : null}
          <AdminButton
            disabled={!dirty || saving || uploading || publishing}
            onClick={() => void onSave()}
          >
            {saving ? ADMIN_UI.saving : ADMIN_UI.save}
          </AdminButton>
        </div>
      </div>
    </div>
  );
};

export default TourEditorPage;
