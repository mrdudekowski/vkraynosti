import {
  faShieldHalved,
  faMap,
  faKitMedical,
  faCloudSun,
  faSatelliteDish,
  faHelicopter,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export const SAFETY_ICON_MAP: Record<string, IconDefinition> = {
  'shield-halved':  faShieldHalved,
  'map':            faMap,
  'kit-medical':    faKitMedical,
  'cloud-sun':      faCloudSun,
  'satellite-dish': faSatelliteDish,
  'helicopter':     faHelicopter,
};
