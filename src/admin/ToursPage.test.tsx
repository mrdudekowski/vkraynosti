import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from './constants/ui';

vi.mock('./api', () => ({
  adminListTours: vi.fn(),
}));

import { adminListTours } from './api';
import ToursPage from './ToursPage';

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

describe('ToursPage', () => {
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
  });

  it('открывает сезон и индивидуальные туры с хаба', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ToursPage />} />
          <Route path="/seasons/:season" element={<LocationProbe />} />
          <Route path="/individual" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('link', { name: /Зима/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_UI.individualTours })).toBeInTheDocument();
    expect(screen.queryByText('Изюбриная')).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Зима/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('/seasons/winter');
  });
});
