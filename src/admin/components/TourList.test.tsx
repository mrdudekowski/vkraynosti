import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { AdminTourListItem } from '../api';
import { ADMIN_UI } from '../constants/ui';
import TourList from './TourList';

const tours: AdminTourListItem[] = [
  {
    id: 'winter-1',
    title: 'Изюбриная',
    season: 'winter',
    status: 'active',
    published: true,
    imageUrl: null,
  },
  {
    id: 'winter-2',
    title: 'Черновик зимы',
    season: 'winter',
    status: 'draft',
    published: false,
    imageUrl: null,
  },
];

describe('TourList', () => {
  it('показывает название и видимость на карточке', () => {
    render(
      <MemoryRouter>
        <TourList tours={tours} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Изюбриная/ })).toHaveTextContent(
      ADMIN_UI.tourVisibility.on_site,
    );
    expect(screen.getByRole('link', { name: /Черновик зимы/ })).toHaveTextContent(
      ADMIN_UI.tourVisibility.hidden,
    );
  });

  it('фильтрует скрытые туры', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TourList tours={tours} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: ADMIN_UI.tourVisibility.hidden }));
    expect(screen.queryByRole('link', { name: /Изюбриная/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Черновик зимы/ })).toBeInTheDocument();
  });

  it('в пустом каталоге объясняет, что делать дальше', () => {
    render(
      <MemoryRouter>
        <TourList tours={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByText(ADMIN_UI.emptyList)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.emptyListHint)).toBeInTheDocument();
  });
});
