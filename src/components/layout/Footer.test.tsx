import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Footer from './Footer';

vi.mock('../../context/useCookieConsent', () => ({
  useCookieConsent: () => ({ openBanner: vi.fn() }),
}));

vi.mock('../../context/SiteContentContext', () => ({
  useSiteContent: () => ({
    contacts: {
      kind: 'contacts',
      schemaVersion: 1,
      sectionVisible: true,
      channels: [
        { id: 'current-phone', label: '+7 999 111-22-33', href: 'tel:+79991112233', type: 'phone', visible: true, order: 0 },
      ],
    },
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
            { id: 'missing-pdf', type: 'pdf', label: 'Пустой PDF', value: 'Пустой PDF', documentId: 'missing-pdf', visible: true, order: 3 },
          ],
        },
        {
          id: 'navigation',
          heading: 'Навигация',
          visible: true,
          order: 1,
          rows: [
            { id: 'nav-contact', type: 'link', label: 'Контакты', value: 'Контакты', href: '/#contact', visible: true, order: 0 },
          ],
        },
        {
          id: 'contacts',
          heading: 'Старые контакты',
          visible: true,
          order: 2,
          rows: [
            { id: 'old-contact', type: 'link', label: 'Старый телефон', value: 'Старый телефон', href: 'tel:+70000000000', visible: true, order: 0 },
          ],
        },
        {
          id: 'bottom',
          heading: '',
          visible: true,
          order: 3,
          rows: [
            { id: 'cookie-settings', type: 'text', label: 'Cookies', value: 'Настройки cookies', visible: false, order: 0 },
            { id: 'studio', type: 'link', label: 'SILA', value: 'SILA', href: 'https://example.com', visible: false, order: 1 },
          ],
        },
        {
          id: 'custom',
          heading: 'Пользовательский блок',
          visible: true,
          order: 4,
          rows: [
            { id: 'custom-link', type: 'link', label: 'Новая ссылка', value: 'Новая ссылка', href: '/custom', visible: true, order: 0 },
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

  it('renders visible CMS footer link rows instead of static navigation only', () => {
    render(<Footer />, { wrapper: MemoryRouter });

    expect(screen.getByRole('link', { name: 'Новая ссылка' })).toHaveAttribute('href', '/custom');
  });

  it('keeps seasonal links when CMS navigation is present', () => {
    render(<Footer />, { wrapper: MemoryRouter });

    expect(screen.getByRole('link', { name: /Зима/ })).toHaveAttribute('href', '/tours/winter');
    expect(screen.getByRole('link', { name: /Весна/ })).toHaveAttribute('href', '/tours/spring');
    expect(screen.getByRole('link', { name: /Лето/ })).toHaveAttribute('href', '/tours/summer');
    expect(screen.getByRole('link', { name: /Осень/ })).toHaveAttribute('href', '/tours/fall');
  });

  it('uses canonical contacts and omits unavailable or hidden footer controls', () => {
    render(<Footer />, { wrapper: MemoryRouter });

    expect(screen.getByRole('link', { name: '+7 999 111-22-33' })).toHaveAttribute('href', 'tel:+79991112233');
    expect(screen.queryByRole('link', { name: 'Старый телефон' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Пустой PDF' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Настройки cookies' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'SILA' })).not.toBeInTheDocument();
  });
});
