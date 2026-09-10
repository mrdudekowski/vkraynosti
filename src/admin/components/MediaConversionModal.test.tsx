import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MediaConversionModal from './MediaConversionModal';

vi.mock('../../hooks/useModalFocusTrap', () => ({ useModalFocusTrap: vi.fn() }));

describe('MediaConversionModal', () => {
  it('shows the approved copy and progress', () => {
    render(<MediaConversionModal open progress={42} />);
    expect(screen.getByText('Конвертирую неведомый формат в православный JPG')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveValue(42);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('clamps progress to 100 percent', () => {
    render(<MediaConversionModal open progress={120} />);
    expect(screen.getByRole('progressbar')).toHaveValue(100);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('offers retry on conversion error', () => {
    const onRetry = vi.fn();
    render(<MediaConversionModal open progress={80} error="conversion" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Попробовать ещё раз' }).click();
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
