import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ADMIN_UI } from './constants/ui';
import DepartureStatus from './components/DepartureStatus';

describe('DepartureStatus', () => {
  it('renders open status with accessible label', () => {
    render(<DepartureStatus status="open" compact />);
    expect(screen.getByText(ADMIN_UI.departureStatus.open)).toBeInTheDocument();
  });

  it('renders planned status with icon label', () => {
    render(<DepartureStatus status="planned" compact />);
    expect(screen.getByText(ADMIN_UI.departureStatus.planned)).toBeInTheDocument();
  });

  it('renders cancelled status', () => {
    render(<DepartureStatus status="cancelled" compact />);
    expect(screen.getByText(ADMIN_UI.departureStatus.cancelled)).toBeInTheDocument();
  });
});
