import { describe, expect, it } from 'vitest';
import {
  getLegalDocumentUrl,
  LEGAL_DOCUMENTS,
  LEGAL_DOCUMENTS_FOOTER,
} from './legalDocuments';

describe('legalDocuments', () => {
  it('exposes four footer documents', () => {
    expect(LEGAL_DOCUMENTS_FOOTER).toHaveLength(4);
  });

  it('builds public URLs under /legal/', () => {
    expect(getLegalDocumentUrl('personal-data-policy')).toMatch(/\/legal\/personal-data-policy\.pdf$/);
  });

  it('marks policy and consent for tour request modal', () => {
    expect(LEGAL_DOCUMENTS['personal-data-policy'].showInTourRequestModal).toBe(true);
    expect(LEGAL_DOCUMENTS['personal-data-consent'].showInTourRequestModal).toBe(true);
  });
});
