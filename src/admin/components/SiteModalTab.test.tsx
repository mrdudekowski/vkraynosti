import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ContactsContentDocument, ModalContentDocument } from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import SiteModalTab from './SiteModalTab';

const modal: ModalContentDocument = {
  kind: 'modal',
  schemaVersion: 1,
  requestFormEnabled: true,
  contactTitle: 'Свяжитесь с нами',
  contactDescription: 'Выберите канал',
  tourContactTitle: 'Забронируйте тур',
};

const contacts: ContactsContentDocument = {
  kind: 'contacts',
  schemaVersion: 1,
  sectionVisible: true,
  channels: [
    {
      id: 'channel-1',
      label: 'Telegram',
      href: 'https://t.me/example',
      type: 'telegram',
      visible: true,
      order: 0,
    },
  ],
};

describe('SiteModalTab', () => {
  it('puts a request preview beside the mode selector', () => {
    render(<SiteModalTab value={modal} onChange={vi.fn()} contacts={contacts} />);

    expect(screen.getByRole('complementary', { name: ADMIN_UI.siteModalPreview })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.siteModalRequestTitle)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Отправить заявку' })).not.toBeInTheDocument();
  });

  it('previews contact copy and channels in contacts mode', () => {
    render(
      <SiteModalTab
        value={{ ...modal, requestFormEnabled: false }}
        onChange={vi.fn()}
        contacts={contacts}
      />,
    );

    expect(screen.getByRole('complementary', { name: ADMIN_UI.siteModalPreview })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.siteModalContactsTitle)).toBeInTheDocument();
    expect(screen.getByLabelText(ADMIN_UI.siteModalContactTitle)).toHaveValue('Свяжитесь с нами');
    expect(screen.getByText('Telegram')).toBeInTheDocument();
  });

  it('switches preview with the mode selector', () => {
    const onChange = vi.fn();
    render(<SiteModalTab value={modal} onChange={onChange} contacts={contacts} />);

    fireEvent.click(screen.getByRole('radio', { name: ADMIN_UI.siteModalContacts }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ requestFormEnabled: false }));
  });
});
