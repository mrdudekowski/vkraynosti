export type CatalogMirrorState = 'up' | 'down';

let catalogMirrorState: CatalogMirrorState = 'down';

export function getCatalogMirrorState(): CatalogMirrorState {
  return catalogMirrorState;
}

export function setCatalogMirrorState(state: CatalogMirrorState): void {
  catalogMirrorState = state;
}
