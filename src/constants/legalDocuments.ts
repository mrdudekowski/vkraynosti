import { APP_ASSET_BASE } from './publicAssetBase';

export type LegalDocumentId =
  | 'offer-and-safety'
  | 'payment-cancellation-refund'
  | 'personal-data-policy'
  | 'personal-data-consent';

export interface LegalDocument {
  id: LegalDocumentId;
  /** File under `public/legal/`. */
  filename: string;
  /** Visible title (footer, links, download). */
  title: string;
  showInFooter: boolean;
  showInTourRequestModal: boolean;
}

export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
  'offer-and-safety': {
    id: 'offer-and-safety',
    filename: 'offer-and-safety.pdf',
    title: 'Оферта и правила безопасности',
    showInFooter: true,
    showInTourRequestModal: false,
  },
  'payment-cancellation-refund': {
    id: 'payment-cancellation-refund',
    filename: 'payment-cancellation-refund.pdf',
    title: 'Условия оплаты, отмены и возврата',
    showInFooter: true,
    showInTourRequestModal: false,
  },
  'personal-data-policy': {
    id: 'personal-data-policy',
    filename: 'personal-data-policy.pdf',
    title: 'Политика обработки персональных данных',
    showInFooter: true,
    showInTourRequestModal: true,
  },
  'personal-data-consent': {
    id: 'personal-data-consent',
    filename: 'personal-data-consent.pdf',
    title: 'Согласие на обработку персональных данных',
    showInFooter: true,
    showInTourRequestModal: true,
  },
} as const;

export const LEGAL_DOCUMENTS_FOOTER = (
  Object.values(LEGAL_DOCUMENTS) as LegalDocument[]
).filter((doc) => doc.showInFooter);

/** Public URL for download / open in new tab. */
export const getLegalDocumentUrl = (id: LegalDocumentId): string =>
  `${APP_ASSET_BASE}legal/${LEGAL_DOCUMENTS[id].filename}`;
