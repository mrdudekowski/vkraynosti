import { describe, expect, it } from 'vitest';
import {
  getLegalDocumentUrl,
  LEGAL_DOCUMENTS,
  LEGAL_DOCUMENTS_FOOTER,
  resolveFooterPdfHref,
} from './legalDocuments';
import { DEFAULT_SITE_URL } from './siteUrl';

describe('legalDocuments', () => {
  it('exposes four footer documents', () => {
    expect(LEGAL_DOCUMENTS_FOOTER).toHaveLength(4);
  });

  it('builds public URLs on the live site origin', () => {
    expect(getLegalDocumentUrl('personal-data-policy')).toBe(
      `${DEFAULT_SITE_URL}/legal/personal-data-policy.pdf`,
    );
    expect(getLegalDocumentUrl('offer-and-safety')).not.toContain('localhost');
  });

  it('rewrites stored localhost PDF URLs to the public site', () => {
    expect(
      resolveFooterPdfHref({
        documentId: 'offer-and-safety',
        asset: { url: 'http://localhost/legal/offer-and-safety.pdf' },
      }),
    ).toBe(`${DEFAULT_SITE_URL}/legal/offer-and-safety.pdf`);
  });

  it('keeps a CMS-uploaded public PDF URL', () => {
    expect(
      resolveFooterPdfHref({
        documentId: 'offer-and-safety',
        asset: {
          url: 'https://ypnmfvotln.cdn.twcstorage.ru/media/site-content/footer/abc.pdf',
        },
      }),
    ).toBe('https://ypnmfvotln.cdn.twcstorage.ru/media/site-content/footer/abc.pdf');
  });

  it('marks policy and consent for tour request modal', () => {
    expect(LEGAL_DOCUMENTS['personal-data-policy'].showInTourRequestModal).toBe(true);
    expect(LEGAL_DOCUMENTS['personal-data-consent'].showInTourRequestModal).toBe(true);
  });
});
