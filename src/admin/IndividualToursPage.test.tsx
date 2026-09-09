import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import IndividualToursPage from './IndividualToursPage';

const LocationProbe = () => <output data-testid="location">{useLocation().pathname}</output>;

describe('IndividualToursPage', () => {
  it('возвращает прямой вход в скрытый раздел к сезонным турам', () => {
    render(
      <MemoryRouter initialEntries={['/individual']}>
        <Routes>
          <Route path="/individual" element={<IndividualToursPage />} />
          <Route path="/tours" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/tours');
  });
});
