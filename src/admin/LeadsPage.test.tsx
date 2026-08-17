import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmptyCrmFile, type CrmFile } from '../crm/crmDocument';
import { ADMIN_UI } from './constants/ui';

vi.mock('./api', () => ({
  adminGetCrm: vi.fn(),
  adminCreateCrmPerson: vi.fn(),
  adminListTours: vi.fn(),
  adminAddCrmTouch: vi.fn(),
  adminUpdateCrmDeal: vi.fn(),
  adminUpdateCrmPerson: vi.fn(),
  adminCreateCrmDeal: vi.fn(),
}));

import { adminCreateCrmPerson, adminGetCrm, adminListTours } from './api';
import LeadsPage from './LeadsPage';

const file: CrmFile = {
  ...createEmptyCrmFile(),
  people: [
    {
      id: 'p1',
      name: 'Анна',
      phone: '+79001112233',
      messenger: 'telegram',
      messengerHandle: '@anna',
      note: '',
      folder: null,
      createdAt: '2026-08-16T00:00:00.000Z',
      updatedAt: '2026-08-16T00:00:00.000Z',
    },
  ],
  deals: [
    {
      id: 'd1',
      personId: 'p1',
      tourId: 'winter-1',
      tourTitle: 'Изюбриная',
      date: '2026-08-20',
      status: 'new',
      paid: false,
      doubts: true,
      pauseReason: '',
      comment: 'дорого',
      nextStep: 'перезвонить',
      nextStepAt: '2026-08-18',
      source: 'admin',
      ownerLogin: 'alice',
      touches: [],
      createdAt: '2026-08-16T00:00:00.000Z',
      updatedAt: '2026-08-16T01:00:00.000Z',
    },
  ],
};

describe('LeadsPage', () => {
  beforeEach(() => {
    vi.mocked(adminGetCrm).mockResolvedValue(file);
    vi.mocked(adminListTours).mockResolvedValue([
      {
        id: 'winter-1',
        title: 'Изюбриная',
        season: 'winter',
        status: 'active',
        published: true,
        imageUrl: null,
      },
    ]);
    vi.mocked(adminCreateCrmPerson).mockResolvedValue({ ...file, personId: 'p1' });
  });

  it('показывает лид с туром, датой и комментарием', async () => {
    render(
      <MemoryRouter initialEntries={['/leads']}>
        <Routes>
          <Route path="/leads" element={<LeadsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Анна')).toBeInTheDocument();
    expect(screen.getByText(/Изюбриная/)).toBeInTheDocument();
    expect(screen.getByText('дорого')).toBeInTheDocument();
  });

  it('открывает форму создания, а не держит её на странице', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/leads']}>
        <Routes>
          <Route path="/leads" element={<LeadsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('Анна');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.crmAdd }));
    expect(screen.getByRole('dialog', { name: ADMIN_UI.crmAddTitle })).toBeInTheDocument();
    expect(screen.getByLabelText(ADMIN_UI.crmName)).toBeInTheDocument();
  });
});
