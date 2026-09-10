import { faCloudSun } from '@fortawesome/free-solid-svg-icons/faCloudSun';
import { faHelicopter } from '@fortawesome/free-solid-svg-icons/faHelicopter';
import { faKitMedical } from '@fortawesome/free-solid-svg-icons/faKitMedical';
import { faMap } from '@fortawesome/free-solid-svg-icons/faMap';
import { faSatelliteDish } from '@fortawesome/free-solid-svg-icons/faSatelliteDish';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons/faShieldHalved';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export const SAFETY_ICON_MAP: Record<string, IconDefinition> = {
  'shield-halved':  faShieldHalved,
  'map':            faMap,
  'kit-medical':    faKitMedical,
  'cloud-sun':      faCloudSun,
  'satellite-dish': faSatelliteDish,
  'helicopter':     faHelicopter,
};
