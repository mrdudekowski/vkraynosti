import { SITE_URL } from './siteUrl';

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

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

export function isLegalDocumentId(id: string): id is LegalDocumentId {
  return Object.prototype.hasOwnProperty.call(LEGAL_DOCUMENTS, id);
}

/** Canonical public URL on vkraynosti.ru — not the current origin or localhost. */
export const getLegalDocumentUrl = (id: LegalDocumentId): string =>
  `${SITE_URL.replace(/\/+$/, '')}/legal/${LEGAL_DOCUMENTS[id].filename}`;

function isLocalHostname(hostname: string): boolean {
  return LOCAL_HOSTS.has(hostname);
}

/** Turn a stored CMS PDF URL into a downloadable public href. */
export function resolveFooterPdfHref(row: {
  documentId: string;
  asset?: { url?: string };
}): string | null {
  const raw = row.asset?.url?.trim() ?? '';
  if (raw.length > 0) {
    try {
      const parsed = new URL(raw, `${SITE_URL.replace(/\/+$/, '')}/`);
      if (!isLocalHostname(parsed.hostname)) {
        return parsed.toString();
      }
    } catch {
      if (raw.startsWith('/legal/') && isLegalDocumentId(row.documentId)) {
        return getLegalDocumentUrl(row.documentId);
      }
    }
  }
  if (isLegalDocumentId(row.documentId)) {
    return getLegalDocumentUrl(row.documentId);
  }
  return raw.length > 0 ? raw : null;
}
