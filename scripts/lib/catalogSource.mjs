function normalizedBase(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : '';
}

function isVkraynostiProductionSite(value) {
  const siteUrl = value?.trim() || 'https://vkraynosti.ru';
  try {
    return /^(?:www\.)?vkraynosti\.ru$/i.test(new URL(siteUrl).hostname);
  } catch {
    return false;
  }
}

export function resolveCatalogSource(env = process.env) {
  const bakeUrl = normalizedBase(env.CMS_BAKE_URL);
  if (bakeUrl) {
    return {
      kind: 'bakeApi',
      bakeUrl: `${bakeUrl}/api/cms/internal/bake`,
      deploySecret: env.CMS_DEPLOY_SECRET ?? '',
    };
  }

  const cmsBase = normalizedBase(env.VITE_CMS_S3_BASE_URL);
  if (cmsBase) {
    return {
      kind: 'cms',
      toursUrl: `${cmsBase}/published/tours.json`,
      toursListUrl: `${cmsBase}/published/tour-schedule/tours_list.json`,
      scheduleUrl: `${cmsBase}/published/tour-schedule/schedule.json`,
      siteSeoUrl: `${cmsBase}/published/site-seo/document.json`,
    };
  }

  if (isVkraynostiProductionSite(env.VITE_SITE_URL)) {
    throw new Error(
      'Production SEO build requires VITE_CMS_S3_BASE_URL (or CMS_BAKE_URL); without the published CMS package, tour routes fall back to the legacy slug map.',
    );
  }

  const publicBase = normalizedBase(env.VITE_PUBLIC_S3_BASE_URL) ||
    normalizedBase(env.VITE_PUBLIC_ASSET_BASE_URL);
  if (publicBase) {
    return {
      kind: 'public',
      toursListUrl: `${publicBase}/tour-schedule/tours_list.json`,
      scheduleUrl: `${publicBase}/tour-schedule/schedule.json`,
    };
  }

  return null;
}
