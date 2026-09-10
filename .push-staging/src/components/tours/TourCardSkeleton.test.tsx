import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import TourCardSkeleton from './TourCardSkeleton';

describe('TourCardSkeleton', () => {
  it('uses card shell and cover classes aligned with TourCard layout', () => {
    const { container } = render(<TourCardSkeleton />);
    const root = container.firstElementChild;
    expect(root).toHaveClass('tour-card-skeleton-card');
    expect(root?.querySelector('.tour-card-skeleton-card-cover')).toBeInTheDocument();
    expect(root?.querySelector('.rounded-t-card.h-48')).toBeInTheDocument();
    expect(root?.querySelector('.p-card-p')).toBeInTheDocument();
  });

  it('uses compact media height when compact', () => {
    const { container } = render(<TourCardSkeleton compact />);
    expect(container.querySelector('.rounded-t-card.h-32')).toBeInTheDocument();
    expect(container.querySelector('.rounded-t-card.h-48')).not.toBeInTheDocument();
  });

  it('merges className on the root', () => {
    const { container } = render(<TourCardSkeleton className="extra-skel" />);
    expect(container.firstElementChild).toHaveClass('tour-card-skeleton-card', 'extra-skel');
  });
});
