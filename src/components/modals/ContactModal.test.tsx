import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ContactModal from './ContactModal';

vi.mock('../../context/useModal', () => ({ useModal: () => ({ closeModal: vi.fn() }) }));
vi.mock('../../hooks/useBodyScrollLock', () => ({ useBodyScrollLock: vi.fn() }));
vi.mock('../../hooks/useModalFocusTrap', () => ({ useModalFocusTrap: vi.fn() }));
vi.mock('../../context/SiteContentContext', () => ({
  useSiteContent: () => ({
    modal: { kind: 'modal', schemaVersion: 1, requestFormEnabled: false, contactTitle: 'Свяжитесь с нами', contactDescription: 'Выберите канал.', tourContactTitle: 'Свяжитесь с нами и забронируйте тур' },
    contacts: { kind: 'contacts', schemaVersion: 1, sectionVisible: true, channels: [
      { id: 'phone', label: '+7 900 000-00-00', href: 'tel:+79000000000', type: 'phone', visible: true, order: 0 },
      { id: 'hidden', label: 'Не показывать', href: 'https://hidden.test', type: 'link', visible: false, order: 1 },
      { id: 'telegram', label: '@vkraynosti', href: 'https://t.me/vkraynosti', type: 'telegram', visible: true, order: 2 },
    ] },
  }),
}));

describe('ContactModal', () => {
  it('shows visible contacts and tour-specific copy', () => {
    render(<ContactModal tourTitle="Весенний маршрут" />);

    expect(screen.getByRole('heading', { name: 'Свяжитесь с нами и забронируйте тур' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '+7 900 000-00-00' })).toHaveAttribute('href', 'tel:+79000000000');
    expect(screen.getByRole('link', { name: '@vkraynosti' })).toHaveAttribute('href', 'https://t.me/vkraynosti');
    expect(screen.queryByText('Не показывать')).not.toBeInTheDocument();
  });
});
