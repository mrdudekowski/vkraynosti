export class StorageUnavailableError extends Error {
  readonly code = 'storage_unavailable' as const;

  constructor(message = 'storage_unavailable') {
    super(message);
    this.name = 'StorageUnavailableError';
  }
}
