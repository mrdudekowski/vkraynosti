export function parseTourCoverCliArgs(argv) {
  const args = argv.slice(2);
  const options = {
    tourId: null,
    season: null,
    all: false,
    missingOnly: true,
    force: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--tour-id') {
      options.tourId = args[i + 1] ?? null;
      i += 1;
      continue;
    }
    if (arg === '--season') {
      options.season = args[i + 1] ?? null;
      i += 1;
      continue;
    }
    if (arg === '--all') {
      options.all = true;
      options.missingOnly = false;
      continue;
    }
    if (arg === '--missing-only' || arg === '--all-missing') {
      options.missingOnly = true;
      continue;
    }
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.tourId != null && options.season != null) {
    throw new Error('Use either --tour-id or --season, not both');
  }

  if (options.all) {
    options.tourId = null;
    options.season = null;
  }

  return options;
}

export function selectToursForCoverJob(tours, options) {
  let filtered = tours.filter((tour) => tour.imageUrl?.includes('/tours/'));

  if (options.tourId != null) {
    filtered = filtered.filter((tour) => tour.id === options.tourId);
    if (filtered.length === 0) {
      throw new Error(`No tour with id "${options.tourId}" in TOURS`);
    }
    return filtered;
  }

  if (options.season != null) {
    filtered = filtered.filter((tour) => tour.season === options.season);
    if (filtered.length === 0) {
      throw new Error(`No tours for season "${options.season}" in TOURS`);
    }
    return filtered;
  }

  return filtered;
}

export function uniqueCoverUrls(tours) {
  const urls = new Set();
  for (const tour of tours) {
    if (tour.imageUrl) urls.add(tour.imageUrl);
  }
  return [...urls];
}
