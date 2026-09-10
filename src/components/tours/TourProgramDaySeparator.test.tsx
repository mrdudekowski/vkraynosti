import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TourProgramDaySeparator from './TourProgramDaySeparator';

describe('TourProgramDaySeparator', () => {
  it('renders the day label and a seasonal divider', () => {
    render(
      <TourProgramDaySeparator
        step={{ day: 2, timeLabel: '07:00', description: 'Завтрак' }}
        season="spring"
      />
    );

    expect(screen.getByText('День 2')).toBeInTheDocument();
    expect(screen.getByTestId('tour-program-day-divider')).toHaveClass(
      'bg-season-accent-bar-spring'
    );
  });
});
