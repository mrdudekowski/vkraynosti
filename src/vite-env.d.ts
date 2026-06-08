/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_ASSET_BASE_URL?: string;
  readonly VITE_TOUR_REQUEST_ENDPOINT_URL?: string;
  /** @deprecated Используйте VITE_PUBLIC_S3_BASE_URL */
  readonly VITE_TOUR_SCHEDULE_ENDPOINT_URL?: string;
  readonly VITE_PUBLIC_S3_BASE_URL?: string;
  readonly VITE_YANDEX_METRIKA_ID?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
