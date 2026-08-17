import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CmsTourDocument } from '../cms/cmsTourDocument';
import { ADMIN_UI } from './constants/ui';

vi.mock('./api', () => ({
  adminListTours: vi.fn(),
  adminCreateTour: vi.fn(),
}));

import { adminCreateTour, adminListTours } from './api';
import SeasonToursPage from './SeasonToursPage';

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const createdDocument = {
  id: 'winter-2',
  slug: 'novyy-tur',
  season: 'winter',
  status: 'draft',
  title: 'Новый тур',
} as CmsTourDocument;

describe('SeasonToursPage', () => {
  beforeEach(() => {
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
    vi.mocked(adminCreateTour).mockResolvedValue({
      document: createdDocument,
      meta: { rev: 1, updatedAt: '2026-08-16T00:00:00.000Z', editor: 'editor' },
    });
  });

  it('создаёт тур в текущем сезоне', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/seasons/winter']}>
        <Routes>
          <Route path="/seasons/:season" element={<SeasonToursPage />} />
          <Route path="/tours/:tourId" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('link', { name: /Изюбриная/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.addTour }));
    expect(screen.getByRole('dialog', { name: ADMIN_UI.createTourTitle })).toBeInTheDocument();
    expect(screen.queryByLabelText(ADMIN_UI.createTourSeason)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(ADMIN_UI.tourNameLabel), 'Новый тур');
    await user.click(screen.getByRole('button', { name: ADMIN_UI.createTourSubmit }));

    expect(adminCreateTour).toHaveBeenCalledWith({
      title: 'Новый тур',
      season: 'winter',
      slug: 'novyy-tur',
    });
    expect(await screen.findByTestId('location')).toHaveTextContent('/tours/winter-2');
  });
});
