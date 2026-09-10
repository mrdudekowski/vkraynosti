import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Footer from './Footer';

vi.mock('../../context/useCookieConsent', () => ({
  useCookieConsent: () => ({ openBanner: vi.fn() }),
}));

vi.mock('../../context/SiteContentContext', () => ({
  useSiteContent: () => ({
    contacts: { kind: 'contacts', schemaVersion: 1, sectionVisible: true, channels: [] },
    footer: {
      kind: 'footer',
      schemaVersion: 1,
      blocks: [
        {
          id: 'legal',
          heading: 'Юридическая информация',
          visible: true,
          order: 0,
          rows: [
            { id: 'legal-name', type: 'text', label: 'Организация', value: 'ИП Чёрная Эльвира Константиновна', visible: true, order: 0 },
            { id: 'inn', type: 'text', label: 'ИНН', value: '250809067912', visible: true, order: 1 },
            { id: 'legal-address', type: 'text', label: 'Адрес', value: 'Владивосток', visible: true, order: 2 },
          ],
        },
      ],
    },
  }),
}));

describe('Footer', () => {
  it('renders the legal entity name from the published CMS footer document', () => {
    render(<Footer />, { wrapper: MemoryRouter });

    expect(screen.getByText('ИП Чёрная Эльвира Константиновна')).toBeInTheDocument();
    expect(screen.queryByText('ИП Сапон Эльвира Константиновна')).not.toBeInTheDocument();
  });
});
