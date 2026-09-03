import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import { AdminToastProvider } from './AdminToast';
import ProgramSection from './ProgramSection';

describe('ProgramSection', () => {
  it('не показывает стрелки перемещения и добавляет шаг', async () => {
    const user = userEvent.setup();
    const onProgram = vi.fn();
    render(
      <AdminToastProvider>
        <ProgramSection
          program={[
            { day: 1, timeLabel: '04:30', description: 'Выезд' },
            { day: 1, timeLabel: '12:00', description: 'Обед' },
          ]}
          notes={[]}
          onProgram={onProgram}
          onNotes={vi.fn()}
        />
      </AdminToastProvider>,
    );

    expect(screen.queryByRole('button', { name: ADMIN_UI.moveUp })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADMIN_UI.moveDown })).not.toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: ADMIN_UI.dragItem })[0]!);
    expect(screen.getByRole('button', { name: ADMIN_UI.saveOrder })).toBeInTheDocument();
    await user.click(screen.getAllByRole('listitem')[1]!);
    expect(onProgram).toHaveBeenCalledWith([
      { day: 1, timeLabel: '12:00', description: 'Обед' },
      { day: 1, timeLabel: '04:30', description: 'Выезд' },
    ]);

    await user.click(screen.getByRole('button', { name: ADMIN_UI.addStep }));
    expect(onProgram).toHaveBeenCalledWith([
      { day: 1, timeLabel: '04:30', description: 'Выезд' },
      { day: 1, timeLabel: '12:00', description: 'Обед' },
      { day: 1, timeLabel: '', description: '' },
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

  it('фильтрует программу по дням и добавляет шаг в активный день', async () => {
    const user = userEvent.setup();
    const onProgram = vi.fn();
    render(
      <AdminToastProvider>
        <ProgramSection
          durationDays={2}
          program={[
            { day: 1, timeLabel: '04:30', description: 'Выезд' },
            { day: 2, timeLabel: '09:00', description: 'Старт' },
          ]}
          notes={[]}
          onProgram={onProgram}
          onNotes={vi.fn()}
        />
      </AdminToastProvider>,
    );

    const dayTabs = screen.getByRole('tablist', { name: ADMIN_UI.programHeading });
    expect(dayTabs).not.toHaveClass('overflow-x-auto');
    await user.click(screen.getByRole('tab', { name: 'День 2' }));
    expect(screen.getByDisplayValue('Старт')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Выезд')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: ADMIN_UI.addStep }));
    expect(onProgram).toHaveBeenCalledWith([
      { day: 1, timeLabel: '04:30', description: 'Выезд' },
      { day: 2, timeLabel: '09:00', description: 'Старт' },
      { day: 2, timeLabel: '', description: '' },
    ]);
  });
});
