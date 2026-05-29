import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TourRequestModal from './TourRequestModal';
import { UI } from '../../constants/ui';
import { WHATSAPP_LOGO } from '../../constants/images';
import { sendTourRequestLead } from '../../services/sendTourRequestLead';
import { getTourById } from '../../data/toursData';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';

const mockClose = vi.fn();

vi.mock('../../context/useModal', () => ({
  useModal: () => ({
    closeModal: mockClose,
    openTourRequestModal: vi.fn(),
    modal: { type: null },
  }),
}));

vi.mock('../../services/sendTourRequestLead', () => ({
  sendTourRequestLead: vi.fn(),
}));

const spring3 = getTourById('spring-3');
if (!spring3) {
  throw new Error('spring-3 missing');
}

const makeScheduleEvent = (
  date: string,
  tourId: string = 'spring-3'
): EnrichedScheduleEvent => ({
  date,
  tourId,
  durationType: 'однодневный',
  priceRub: 6000,
  seats: 8,
  status: 'open',
  comment: null,
  season: 'spring',
  statusLabel: 'Набор открыт',
  tour: spring3,
});

const { scheduleState } = vi.hoisted(() => ({
  scheduleState: {
    events: [] as EnrichedScheduleEvent[],
  },
}));

vi.mock('../../hooks/useTourSchedule', () => ({
  useTourSchedule: () => ({
    status: 'success' as const,
    events: scheduleState.events,
    eventsByDate: new Map(scheduleState.events.map(event => [event.date, [event]])),
    prices: new Map(),
    durationTypes: new Map(),
    error: null,
    retry: vi.fn(),
  }),
}));

const payload = {
  tourId: 'winter-1',
  title: 'Байкал Зимний',
  subtitle: 'Подзаголовок',
  season: 'winter' as const,
};

const RouterWrap = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('TourRequestModal', () => {
  beforeEach(() => {
    mockClose.mockClear();
    vi.mocked(sendTourRequestLead).mockReset();
    vi.mocked(sendTourRequestLead).mockResolvedValue(undefined);
    scheduleState.events = [makeScheduleEvent('2026-08-15')];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('opens form with pre-filled date when tour has a single future departure', async () => {
    render(
      <TourRequestModal
        payload={{ tourId: 'spring-3', title: spring3.title, season: 'spring' }}
      />,
      { wrapper: RouterWrap }
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: UI.tourRequestModal.title })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: UI.tourRequestModal.dateStepTitle })
    ).not.toBeInTheDocument();
    expect(screen.getByDisplayValue(/15 августа 2026/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: UI.tourRequestModal.changeDepartureDate })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(`^${UI.tourRequestModal.nameLabel}`))).toBeInTheDocument();
  });

  it('opens calendar from single-departure form and returns after day click', async () => {
    const user = userEvent.setup();
    render(
      <TourRequestModal
        payload={{ tourId: 'spring-3', title: spring3.title, season: 'spring' }}
      />,
      { wrapper: RouterWrap }
    );

    await user.click(
      screen.getByRole('button', { name: UI.tourRequestModal.changeDepartureDate })
    );
    expect(
      screen.getByRole('heading', { name: UI.tourRequestModal.dateStepTitle })
    ).toBeInTheDocument();

    const dayButton = screen.getByRole('button', { name: /Выезд: 15 августа 2026/i });
    await user.click(dayButton);
    await waitFor(() => {
      expect(screen.getByDisplayValue(/15 августа 2026/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(new RegExp(`^${UI.tourRequestModal.nameLabel}`))).toBeInTheDocument();
  });

  it('opens date step first when tour has multiple future departures', async () => {
    scheduleState.events = [
      makeScheduleEvent('2026-08-15'),
      makeScheduleEvent('2026-08-22'),
    ];
    const user = userEvent.setup();
    render(
      <TourRequestModal
        payload={{ tourId: 'spring-3', title: spring3.title, season: 'spring' }}
      />,
      { wrapper: RouterWrap }
    );
    expect(
      screen.getByRole('heading', { name: UI.tourRequestModal.dateStepTitle })
    ).toBeInTheDocument();
    const dayButton = screen.getByRole('button', { name: /Выезд: 15 августа 2026/i });
    await user.click(dayButton);
    await waitFor(() => {
      expect(screen.getByDisplayValue(/15 августа 2026/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(new RegExp(`^${UI.tourRequestModal.nameLabel}`))).toBeInTheDocument();
  });

  it('opens form directly when tour has no departures in schedule', () => {
    render(<TourRequestModal payload={payload} />, { wrapper: RouterWrap });
    expect(screen.getByDisplayValue(/Байкал Зимний/)).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: UI.tourRequestModal.dateStepTitle })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: UI.tourRequestModal.changeDepartureDate })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(new RegExp(`^${UI.tourRequestModal.departureDateLabel}`))
    ).not.toBeInTheDocument();
  });

  it('closes when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<TourRequestModal payload={payload} />, { wrapper: RouterWrap });
    await user.click(screen.getByRole('presentation'));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('renders messenger radios as selectable contact buttons', async () => {
    const user = userEvent.setup();
    render(<TourRequestModal payload={payload} />, { wrapper: RouterWrap });

    const whatsappLabel = screen.getByRole('radio', {
      name: UI.tourRequestModal.messengerWhatsappAria,
    }).closest('label');
    expect(whatsappLabel).toHaveClass('home-contact-messenger-btn--selectable');
    expect(whatsappLabel).toHaveClass('home-contact-messenger-btn--whatsapp');
    expect(whatsappLabel?.querySelector('.home-contact-messenger-icon-well')).toBeInTheDocument();
    expect(whatsappLabel?.querySelector(`img[src="${WHATSAPP_LOGO}"]`)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: UI.tourRequestModal.messengerTelegramAria }));

    const telegramLabel = screen.getByRole('radio', {
      name: UI.tourRequestModal.messengerTelegramAria,
    }).closest('label');
    expect(telegramLabel).toHaveClass('home-contact-messenger-btn--selectable');
    expect(telegramLabel).toHaveClass('home-contact-messenger-btn--telegram');
    expect(telegramLabel?.querySelector('.home-contact-messenger-icon-well')).toBeInTheDocument();
  });

  it('emits non-sensitive submit event on successful submit', async () => {
    const user = userEvent.setup();

    render(<TourRequestModal payload={payload} />, { wrapper: RouterWrap });

    await user.type(screen.getByLabelText(new RegExp(`^${UI.tourRequestModal.nameLabel}`)), 'Иван');
    await user.type(screen.getByLabelText(new RegExp(`^${UI.tourRequestModal.phoneLabel}`)), '+79991234567');
    await user.type(screen.getByLabelText(new RegExp(`^${UI.tourRequestModal.questionLabel}`)), 'Вопрос по туру');
    await user.click(screen.getByRole('radio', { name: UI.tourRequestModal.messengerTelegramAria }));
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: UI.tourRequestModal.submit }));

    await waitFor(
      () => {
        expect(sendTourRequestLead).toHaveBeenCalledWith(
          payload,
          expect.objectContaining({
            name: 'Иван',
            phone: '+79991234567',
            question: 'Вопрос по туру',
            preferredMessenger: 'telegram',
            privacyAccepted: true,
          })
        );
      },
      { timeout: 3000 }
    );
    expect(await screen.findByRole('status', undefined, { timeout: 3000 })).toHaveTextContent(
      UI.tourRequestModal.success
    );
  });

  it('submits without question when other fields are valid', async () => {
    const user = userEvent.setup();

    render(<TourRequestModal payload={payload} />, { wrapper: RouterWrap });

    await user.type(screen.getByLabelText(new RegExp(`^${UI.tourRequestModal.nameLabel}`)), 'Иван');
    await user.type(screen.getByLabelText(new RegExp(`^${UI.tourRequestModal.phoneLabel}`)), '+79991234567');
    await user.click(screen.getByRole('radio', { name: UI.tourRequestModal.messengerTelegramAria }));
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: UI.tourRequestModal.submit }));

    await waitFor(
      () => {
        expect(sendTourRequestLead).toHaveBeenCalledWith(
          payload,
          expect.objectContaining({
            name: 'Иван',
            phone: '+79991234567',
            question: '',
            preferredMessenger: 'telegram',
            privacyAccepted: true,
          })
        );
      },
      { timeout: 3000 }
    );
    expect(await screen.findByRole('status', undefined, { timeout: 3000 })).toHaveTextContent(
      UI.tourRequestModal.success
    );
  });
});
