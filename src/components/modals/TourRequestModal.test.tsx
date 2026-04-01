import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TourRequestModal from './TourRequestModal';
import { UI } from '../../constants/ui';

const mockClose = vi.fn();

vi.mock('../../context/useModal', () => ({
  useModal: () => ({
    closeModal: mockClose,
    openTeamModal: vi.fn(),
    openTourRequestModal: vi.fn(),
    modal: { type: null },
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens dialog with title and tour line', () => {
    render(<TourRequestModal payload={payload} />, { wrapper: RouterWrap });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: UI.tourRequestModal.title })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Байкал Зимний/)).toBeInTheDocument();
  });

  it('closes when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<TourRequestModal payload={payload} />, { wrapper: RouterWrap });
    await user.click(screen.getByRole('presentation'));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('logs sanitized payload on successful submit', async () => {
    const user = userEvent.setup();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<TourRequestModal payload={payload} />, { wrapper: RouterWrap });

    await user.type(screen.getByLabelText(new RegExp(`^${UI.tourRequestModal.nameLabel}`)), 'Иван');
    await user.type(screen.getByLabelText(new RegExp(`^${UI.tourRequestModal.phoneLabel}`)), '+79991234567');
    await user.type(screen.getByLabelText(new RegExp(`^${UI.tourRequestModal.questionLabel}`)), 'Вопрос по туру');
    await user.click(screen.getByRole('radio', { name: UI.tourRequestModal.messengerTelegramAria }));
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: UI.tourRequestModal.submit }));

    await waitFor(
      () => {
        expect(logSpy).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    const logged = logSpy.mock.calls.find(c => c[0] === '[tourRequest]');
    expect(logged).toBeDefined();
    expect(logged?.[1]).toMatchObject({
      tourId: 'winter-1',
      name: 'Иван',
      preferredMessenger: 'telegram',
      question: 'Вопрос по туру',
    });

    logSpy.mockRestore();
  });
});
