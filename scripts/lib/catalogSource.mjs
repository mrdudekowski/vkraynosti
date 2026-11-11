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
    const deploySecret = env.CMS_DEPLOY_SECRET?.trim();
    if (!deploySecret) {
      throw new Error('CMS_BAKE_URL requires CMS_DEPLOY_SECRET');
    }
    return {
      kind: 'bakeApi',
      bakeUrl: `${bakeUrl}/api/cms/internal/bake`,
      deploySecret,
    };
  }

  if (isVkraynostiProductionSite(env.VITE_SITE_URL)) {
    throw new Error('Production SEO build requires CMS_BAKE_URL and CMS_DEPLOY_SECRET');
  }

  const cmsBase = normalizedBase(env.VITE_CMS_S3_BASE_URL);
  if (cmsBase) {
    throw new Error('CMS CDN packages cannot be used as a deployment snapshot; configure CMS_BAKE_URL and CMS_DEPLOY_SECRET');
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
