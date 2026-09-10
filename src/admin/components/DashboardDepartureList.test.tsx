import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import { formatScheduleDayTitle } from '../formatAdminCopy';
import { formatAdminOverflow } from '../formatAdminCopy';
import DashboardDepartureList from './DashboardDepartureList';

describe('DashboardDepartureList', () => {
  it('shows a formatted start date, status and configured capacity for an upcoming departure', () => {
    render(
      <MemoryRouter>
        <DashboardDepartureList
          title="Ближайшие"
          emptyTitle="Ближайших выездов нет"
          emptyDescription="Запланируйте выезд в календаре."
          actionLabel="Открыть календарь"
          actionTo="/schedule"
          departures={[
            {
              id: 'departure-1',
              tourId: 'winter-1',
              startsOn: '2026-08-19',
              endsOn: '2026-08-20',
              seats: 8,
              status: 'open',
              version: 1,
              createdAt: '2026-08-18T00:00:00.000Z',
              updatedAt: '2026-08-18T00:00:00.000Z',
            },
          ]}
          tourTitles={{ 'winter-1': 'Северное Приморье' }}
          tourImageUrls={{ 'winter-1': 'https://cdn.example/winter-1.webp' }}
          todayIso="2026-08-18"
        />,
      </MemoryRouter>,
    );

    expect(screen.getByText('19 августа')).toBeVisible();
    expect(screen.getByText('Северное Приморье')).toBeVisible();
    expect(screen.getByText('Набор открыт')).toBeVisible();
    expect(screen.getByText('Мест: 8')).toBeVisible();
    expect(screen.getByText('Завтра')).toBeVisible();
    expect(screen.getByRole('img', { name: 'Северное Приморье' })).toHaveAttribute(
      'src',
      'https://cdn.example/winter-1.webp',
    );
    expect(screen.getByRole('link', { name: /Северное Приморье/ })).toHaveAttribute(
      'href',
      '/schedule?date=2026-08-19&departure=departure-1',
    );
  });

  it('groups more than three tours on one date behind overflow avatars', async () => {
    const user = userEvent.setup();
    const tours = ['winter-1', 'winter-2', 'winter-3', 'winter-4'] as const;
    render(
      <MemoryRouter>
        <DashboardDepartureList
          title="Ближайшие"
          emptyTitle="Ближайших выездов нет"
          emptyDescription="Запланируйте выезд в календаре."
          actionLabel="Открыть календарь"
          actionTo="/schedule"
          departures={tours.map((tourId, index) => ({
            id: `departure-${index + 1}`,
            tourId,
            startsOn: '2026-08-22',
            endsOn: '2026-08-22',
            seats: 8,
            status: 'open',
            version: 1,
            createdAt: '2026-08-18T00:00:00.000Z',
            updatedAt: '2026-08-18T00:00:00.000Z',
          }))}
          tourTitles={{
            'winter-1': 'Один',
            'winter-2': 'Два',
            'winter-3': 'Три',
            'winter-4': 'Четыре',
          }}
          tourImageUrls={{
            'winter-1': 'https://cdn.example/1.webp',
            'winter-2': 'https://cdn.example/2.webp',
            'winter-3': 'https://cdn.example/3.webp',
            'winter-4': 'https://cdn.example/4.webp',
          }}
          todayIso="2026-08-18"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Один')).toBeVisible();
    expect(screen.getByText('Два')).toBeVisible();
    expect(screen.getByText('Три')).toBeVisible();
    expect(screen.queryByRole('link', { name: /Четыре/ })).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: `${ADMIN_UI.scheduleChipListTitle}. ${formatAdminOverflow(1)}`,
      }),
    );
    expect(await screen.findByRole('dialog', { name: formatScheduleDayTitle('2026-08-22') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Четыре/ })).toBeInTheDocument();
  });

  it('switches planned to open from the status label', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    render(
      <MemoryRouter>
        <DashboardDepartureList
          title="Ближайшие"
          emptyTitle="Ближайших выездов нет"
          emptyDescription="Запланируйте выезд в календаре."
          actionLabel="Открыть календарь"
          actionTo="/schedule"
          departures={[
            {
              id: 'departure-1',
              tourId: 'winter-1',
              startsOn: '2026-08-22',
              endsOn: '2026-08-22',
              seats: 8,
              status: 'planned',
              version: 1,
              createdAt: '2026-08-18T00:00:00.000Z',
              updatedAt: '2026-08-18T00:00:00.000Z',
            },
          ]}
          tourTitles={{ 'winter-1': 'Полуостров Гамова' }}
          onStatusChange={onStatusChange}
        />
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole('button', {
        name: `${ADMIN_UI.departureStatusMenu}: ${ADMIN_UI.departureStatus.planned}`,
      }),
    );
    await user.click(screen.getByRole('menuitemradio', { name: ADMIN_UI.departureStatus.open }));
    expect(onStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'departure-1' }),
      'open',
    );
  });
});
