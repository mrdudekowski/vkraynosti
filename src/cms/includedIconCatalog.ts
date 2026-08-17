import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBed } from '@fortawesome/free-solid-svg-icons/faBed';
import { faBinoculars } from '@fortawesome/free-solid-svg-icons/faBinoculars';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons/faBookOpen';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons/faChalkboardTeacher';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faDog } from '@fortawesome/free-solid-svg-icons/faDog';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { faHelmetSafety } from '@fortawesome/free-solid-svg-icons/faHelmetSafety';
import { faHotTubPerson } from '@fortawesome/free-solid-svg-icons/faHotTubPerson';
import { faMugHot } from '@fortawesome/free-solid-svg-icons/faMugHot';
import { faMugSaucer } from '@fortawesome/free-solid-svg-icons/faMugSaucer';
import { faPaw } from '@fortawesome/free-solid-svg-icons/faPaw';
import { faPersonHiking } from '@fortawesome/free-solid-svg-icons/faPersonHiking';
import { faPlane } from '@fortawesome/free-solid-svg-icons/faPlane';
import { faShuttleVan } from '@fortawesome/free-solid-svg-icons/faShuttleVan';
import { faSnowboarding } from '@fortawesome/free-solid-svg-icons/faSnowboarding';
import { faSocks } from '@fortawesome/free-solid-svg-icons/faSocks';
import { faTicket } from '@fortawesome/free-solid-svg-icons/faTicket';
import { faTruck } from '@fortawesome/free-solid-svg-icons/faTruck';
import { faUserTie } from '@fortawesome/free-solid-svg-icons/faUserTie';
import { faUtensils } from '@fortawesome/free-solid-svg-icons/faUtensils';
import { faWater } from '@fortawesome/free-solid-svg-icons/faWater';
import { faWind } from '@fortawesome/free-solid-svg-icons/faWind';

const CATALOG: IconDefinition[] = [
  faBed,
  faBinoculars,
  faBookOpen,
  faChalkboardTeacher,
  faCheck,
  faDog,
  faHeart,
  faHelmetSafety,
  faHotTubPerson,
  faMugHot,
  faMugSaucer,
  faPaw,
  faPersonHiking,
  faPlane,
  faShuttleVan,
  faSnowboarding,
  faSocks,
  faTicket,
  faTruck,
  faUserTie,
  faUtensils,
  faWater,
  faWind,
];

export const includedIconByKey: Record<string, IconDefinition> = Object.fromEntries(
  CATALOG.map((icon) => [icon.iconName, icon])
);

export const INCLUDED_ICON_KEYS = CATALOG.map((icon) => icon.iconName);

export const INCLUDED_ICON_CATALOG = CATALOG.map((icon) => ({
  key: icon.iconName,
  icon,
}));

/** Черновик админки: иконка ещё не выбрана. Не входит в каталог витрины. */
export const UNSET_INCLUDED_ICON_KEY = 'unset';

export function isUnsetIncludedIconKey(iconKey: string): boolean {
  return iconKey === UNSET_INCLUDED_ICON_KEY;
}

export function isIncludedIconKey(iconKey: string): boolean {
  return Object.prototype.hasOwnProperty.call(includedIconByKey, iconKey);
}

export function resolveIncludedIcon(iconKey: string): IconDefinition {
  return includedIconByKey[iconKey] ?? faCheck;
}

export function includedIconKey(icon: IconDefinition): string {
  return icon.iconName;
}
