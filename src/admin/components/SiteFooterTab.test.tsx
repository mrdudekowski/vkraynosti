import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { FooterContentDocument } from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import { AdminToastProvider } from './AdminToast';
import SiteFooterTab from './SiteFooterTab';

const document: FooterContentDocument = {
  kind: 'footer',
  schemaVersion: 1,
  blocks: [
    {
      id: 'legal',
      heading: 'Документы',
      visible: true,
      order: 0,
      rows: [
        {
          id: 'row-1',
          type: 'text',
          label: 'ИНН',
          value: '123',
          visible: true,
          order: 0,
        },
      ],
    },
    {
      id: 'navigation',
      heading: 'Навигация',
      visible: true,
      order: 1,
      rows: [],
    },
  ],
};

describe('SiteFooterTab', () => {
  it('stacks footer blocks as full-width sections', () => {
    render(
      <AdminToastProvider>
        <SiteFooterTab value={document} onChange={vi.fn()} onUploadPdf={vi.fn()} />
      </AdminToastProvider>,
    );

    expect(screen.queryByRole('heading', { name: ADMIN_UI.siteTabFooter })).not.toBeInTheDocument();
    const sections = screen.getByDisplayValue('Документы').closest('ul');
    expect(sections).toHaveClass('flex-col');
    expect(sections).not.toHaveClass('xl:grid-cols-4');
    expect(screen.getByDisplayValue('Документы').closest('li')).toHaveClass('admin-editor-surface');
    expect(screen.getByDisplayValue('Навигация')).toBeInTheDocument();
  });

  it('keeps row type switching for links', () => {
    const Harness = () => {
      const [value, setValue] = useState(document);
      return (
        <AdminToastProvider>
          <SiteFooterTab value={value} onChange={setValue} onUploadPdf={vi.fn()} />
        </AdminToastProvider>
      );
    };
    render(<Harness />);

    fireEvent.change(screen.getByLabelText(ADMIN_UI.siteFooterRowType), { target: { value: 'link' } });
    expect(screen.getByLabelText(ADMIN_UI.siteFooterHref)).toBeInTheDocument();
  });
});
