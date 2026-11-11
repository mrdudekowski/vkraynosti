export function resolveLegacyTourRedirectTarget(legacyTour, publishedCmsTours = []) {
  const cmsTour = publishedCmsTours.find((tour) => tour?.id === legacyTour?.id);
  if (cmsTour == null || !['active', 'in_development'].includes(cmsTour.status)) {
    return legacyTour;
  }
  if (cmsTour.season !== legacyTour.season) {
    throw new Error(
      `Legacy tour ${legacyTour.id} season ${legacyTour.season} conflicts with published CMS season ${cmsTour.season}`,
    );
  }
  if (typeof cmsTour.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cmsTour.slug.trim())) {
    throw new Error(`Published CMS tour ${legacyTour.id} has an invalid redirect slug`);
  }
  return cmsTour;
}
