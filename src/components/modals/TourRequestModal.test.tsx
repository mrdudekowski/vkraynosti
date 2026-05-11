import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TourRequestModal from './TourRequestModal';
import { UI } from '../../constants/ui';
import { sendTourRequestLead } from '../../services/sendTourRequestLead';

const mockClose = vi.fn();

vi.mock('../../context/useModal', () => ({
  useModal: () => ({
    closeModal: mockClose,
    openTeamModal: vi.fn(),
    openTourRequestModal: vi.fn(),
    modal: { type: null },
  }),
}));

vi.mock('../../services/sendTourRequestLead', () => ({
  sendTourRequestLead: vi.fn(),
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
  });

  afterEach(() => {
    vi.clearAllMocks();
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
