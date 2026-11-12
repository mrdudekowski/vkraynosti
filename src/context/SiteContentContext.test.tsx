import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPublishedSiteContent } from '../cms/loadSiteContent';
import { useSiteContent } from './SiteContentContext';
import { SiteContentProvider } from './SiteContentContext';

vi.mock('../cms/loadSiteContent', () => ({ loadPublishedSiteContent: vi.fn() }));

function Probe() {
  const { modal } = useSiteContent();
  return <output data-testid="modal-mode">{modal.requestFormEnabled ? 'request' : 'contacts'}</output>;
}

describe('SiteContentProvider', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('applies a valid modal snapshot even when another site snapshot fails', async () => {
    vi.mocked(loadPublishedSiteContent).mockImplementation(async (kind) => {
      if (kind === 'modal') return { kind: 'modal', schemaVersion: 1, requestFormEnabled: false, contactTitle: 'Связаться', contactDescription: '', tourContactTitle: 'Забронировать' };
      return null;
    });
    const { getByTestId } = render(<SiteContentProvider><Probe /></SiteContentProvider>);
    await waitFor(() => expect(getByTestId('modal-mode')).toHaveTextContent('contacts'));
  });

  it('refreshes live site content while the page remains open', async () => {
    vi.useFakeTimers();
    let requestFormEnabled = true;
    vi.mocked(loadPublishedSiteContent).mockImplementation(async (kind) => {
      if (kind === 'modal') {
        const enabled = requestFormEnabled;
        requestFormEnabled = false;
        return { kind: 'modal', schemaVersion: 1, requestFormEnabled: enabled, contactTitle: 'Связаться', contactDescription: '', tourContactTitle: 'Забронировать' };
      }
      return null;
    });
    const { getByTestId } = render(<SiteContentProvider><Probe /></SiteContentProvider>);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(getByTestId('modal-mode').textContent).toBe('request');

    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });

    expect(getByTestId('modal-mode').textContent).toBe('contacts');
  });
});
