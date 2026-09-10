import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { loadPublishedSiteContent } from '../cms/loadSiteContent';
import { useSiteContent } from './SiteContentContext';
import { SiteContentProvider } from './SiteContentContext';

vi.mock('../cms/loadSiteContent', () => ({ loadPublishedSiteContent: vi.fn() }));

function Probe() {
  const { modal } = useSiteContent();
  return <output data-testid="modal-mode">{modal.requestFormEnabled ? 'request' : 'contacts'}</output>;
}

describe('SiteContentProvider', () => {
  it('applies a valid modal snapshot even when another site snapshot fails', async () => {
    vi.mocked(loadPublishedSiteContent).mockImplementation(async (kind) => {
      if (kind === 'modal') return { kind: 'modal', schemaVersion: 1, requestFormEnabled: false, contactTitle: 'Связаться', contactDescription: '', tourContactTitle: 'Забронировать' };
      return null;
    });
    const { getByTestId } = render(<SiteContentProvider><Probe /></SiteContentProvider>);
    await waitFor(() => expect(getByTestId('modal-mode')).toHaveTextContent('contacts'));
  });
});
