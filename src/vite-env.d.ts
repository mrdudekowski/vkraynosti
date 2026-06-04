/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_ASSET_BASE_URL?: string;
  readonly VITE_TOUR_REQUEST_ENDPOINT_URL?: string;
  readonly VITE_TOUR_SCHEDULE_ENDPOINT_URL?: string;
  readonly VITE_YANDEX_METRIKA_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
