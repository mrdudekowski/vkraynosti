import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_TOUR_LIST_VIEW_STORAGE_KEY } from '../../constants/adminUiTokens';
import type { AdminTourListItem } from '../api';
import { adminTourPublicHref } from '../adminTourPublicHref';
import { ADMIN_UI } from '../constants/ui';
import TourList from './TourList';

const tours: AdminTourListItem[] = [
  {
    id: 'winter-1',
    title: 'Изюбриная',
    season: 'winter',
    status: 'active',
    published: true,
    slug: 'izubrinaya',
    imageUrl: null,
    ready: true,
    readyCount: 5,
    readyTotal: 5,
  },
  {
    id: 'winter-2',
    title: 'Черновик зимы',
    season: 'winter',
    status: 'draft',
    published: false,
    slug: 'chernovik-zimy',
    imageUrl: null,
    ready: true,
    readyCount: 5,
    readyTotal: 5,
  },
  {
    id: 'summer-8',
    title: 'Полуостров Краббе',
    season: 'summer',
    status: 'hidden',
    published: true,
    publishedStatus: 'active',
    slug: 'poluostrov-krabbe',
    imageUrl: null,
    ready: true,
    readyCount: 5,
    readyTotal: 5,
  },
];

describe('TourList', () => {
  beforeEach(() => {
    window.localStorage.removeItem(ADMIN_TOUR_LIST_VIEW_STORAGE_KEY);
  });

  it('показывает название и видимость на карточке', () => {
    render(
      <MemoryRouter>
        <TourList tours={tours} />
      </MemoryRouter>,
    );

    expect(within(screen.getAllByRole('article')[0]).getByText(ADMIN_UI.tourLiveVisibility.on_site)).toBeInTheDocument();
    expect(screen.getAllByText(/\d\/5 готово/)).toHaveLength(3);
    expect(within(screen.getAllByRole('article')[1]).getByText(ADMIN_UI.tourLiveVisibility.draft)).toBeInTheDocument();
    expect(within(screen.getAllByRole('article')[2]).getByText(ADMIN_UI.tourLiveVisibility.will_hide)).toBeInTheDocument();
  });

  it('фильтрует черновики', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TourList tours={tours} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: ADMIN_UI.tourVisibility.draft }));
    expect(screen.queryByRole('link', { name: /Изюбриная/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Полуостров Краббе/ })).not.toBeInTheDocument();
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

  it('сбрасывает поиск, если ничего не найдено', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TourList tours={tours} />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(ADMIN_UI.searchTours), 'нет такого');
    expect(screen.getByText(ADMIN_UI.emptySearch)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.emptySearchReset }));
    expect(screen.getByRole('link', { name: /Изюбриная/ })).toBeInTheDocument();
  });

  it('переключает каталог на список', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TourList tours={tours} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: ADMIN_UI.tourViewList }));
    expect(screen.queryByRole('link', { name: /Изюбриная/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Изюбриная' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Изюбриная' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.tourViewList })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: ADMIN_UI.tourViewCards })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('даёт открыть опубликованный тур на сайте и скрыть его из меню', async () => {
    const user = userEvent.setup();
    const onChangeGuestVisibility = vi.fn();
    render(
      <MemoryRouter>
        <TourList tours={tours} onChangeGuestVisibility={onChangeGuestVisibility} />
      </MemoryRouter>,
    );

    const openOnSite = screen.getAllByRole('link', { name: ADMIN_UI.tourOpenOnSite });
    expect(openOnSite).toHaveLength(2);
    expect(openOnSite[0]).toHaveAttribute(
      'href',
      adminTourPublicHref({ id: 'winter-1', season: 'winter', slug: 'izubrinaya' }),
    );
    expect(openOnSite[1]).toHaveAttribute(
      'href',
      adminTourPublicHref({ id: 'summer-8', season: 'summer', slug: 'poluostrov-krabbe' }),
    );
    expect(screen.getAllByRole('button', { name: ADMIN_UI.tourMenu })).toHaveLength(2);

    await user.click(screen.getAllByRole('button', { name: ADMIN_UI.tourMenu })[0]);
    await user.click(screen.getByRole('menuitem', { name: ADMIN_UI.tourHideFromSite }));
    expect(onChangeGuestVisibility).toHaveBeenCalledWith('winter-1', 'hidden');
  });
});
