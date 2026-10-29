export type PublishedSyncState = 'match' | 'drift' | 'unknown';

let publishedSyncState: PublishedSyncState = 'unknown';

export function getPublishedSyncState(): PublishedSyncState {
  return publishedSyncState;
}

export function setPublishedSyncState(state: PublishedSyncState): void {
  publishedSyncState = state;
}
