import type { Tour } from '../types';
import {
  CMS_TOURS_SCHEMA_VERSION,
  parseCmsToursFile,
  type CmsTourDocument,
  type CmsToursFile,
} from './cmsTourDocument';
import { cmsMediaPrefix } from './cmsPackageKeys';
import { createCmsTourMeta, type CmsTourMeta } from './cmsTourMeta';
import { rewriteCmsDocumentAssetBase, siteTourToCmsDocument } from './siteTourToCmsDocument';

export const CMS_DEV_REWRITTEN_TOUR_IDS = ['summer-8'] as const;

export type CmsTourPackage = {
  tourId: string;
  document: CmsTourDocument;
  meta: CmsTourMeta;
};

export function buildCmsTourPackages(
  tours: readonly Tour[],
  options: {
    publicBaseUrl: string;
    rewriteTourIds?: readonly string[];
    rewriteAllTourMedia?: boolean;
    meta?: Partial<CmsTourMeta>;
  }
): CmsTourPackage[] {
  const rewriteIds = options.rewriteAllTourMedia
    ? new Set(tours.map((tour) => tour.id))
    : new Set(options.rewriteTourIds ?? CMS_DEV_REWRITTEN_TOUR_IDS);
  const base = options.publicBaseUrl.replace(/\/+$/, '');

  return tours.map((tour) => {
    const converted = siteTourToCmsDocument(tour);
    const document = rewriteIds.has(tour.id)
      ? rewriteCmsDocumentAssetBase(converted, base, cmsMediaPrefix(tour.id))
      : converted;
    return {
      tourId: document.id,
      document,
      meta: createCmsTourMeta(options.meta),
    };
  });
}

export function compilePublishedToursFile(
  packages: readonly CmsTourPackage[]
): CmsToursFile {
  return parseCmsToursFile({
    schemaVersion: CMS_TOURS_SCHEMA_VERSION,
    tours: packages
      .filter((item) => item.document.status === 'active')
      .map((item) => item.document),
  });
}

export function buildCmsToursFile(
  tours: readonly Tour[],
  options: {
    publicBaseUrl: string;
    rewriteTourIds?: readonly string[];
    rewriteAllTourMedia?: boolean;
  }
): CmsToursFile {
  return compilePublishedToursFile(buildCmsTourPackages(tours, options));
}
