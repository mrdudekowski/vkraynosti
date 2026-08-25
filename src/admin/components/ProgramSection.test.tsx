import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import { AdminToastProvider } from './AdminToast';
import ProgramSection from './ProgramSection';

describe('ProgramSection', () => {
  it('disables first-up and last-down and adds a focused step', async () => {
    const user = userEvent.setup();
    const onProgram = vi.fn();
    render(
      <AdminToastProvider>
        <ProgramSection
          program={[
            { timeLabel: '04:30', description: 'Выезд' },
            { timeLabel: '12:00', description: 'Обед' },
          ]}
          notes={[]}
          onProgram={onProgram}
          onNotes={vi.fn()}
        />
      </AdminToastProvider>,
    );

    expect(screen.getAllByRole('button', { name: ADMIN_UI.moveUp })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: ADMIN_UI.moveDown })[1]).toBeDisabled();

    await user.click(screen.getByRole('button', { name: ADMIN_UI.addStep }));
    expect(onProgram).toHaveBeenCalledWith([
      { timeLabel: '04:30', description: 'Выезд' },
      { timeLabel: '12:00', description: 'Обед' },
      { timeLabel: '', description: '' },
    ]);
  });

  it('shows a compact empty state', () => {
    render(
      <AdminToastProvider>
        <ProgramSection program={[]} notes={[]} onProgram={vi.fn()} onNotes={vi.fn()} />
      </AdminToastProvider>,
    );

    expect(screen.getByText(ADMIN_UI.programEmpty)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: ADMIN_UI.programHeading })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_UI.notesEmpty)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADMIN_UI.addStep })).toBeInTheDocument();
  });
});
