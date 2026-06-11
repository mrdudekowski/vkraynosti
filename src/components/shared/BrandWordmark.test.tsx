import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import BrandWordmark from './BrandWordmark';

describe('BrandWordmark', () => {
  it('renders first letter with spring season gradient class', () => {
    render(<BrandWordmark season="spring" />);

    const firstLetter = screen.getByText('В');
    expect(firstLetter).toHaveClass('bg-season-chrome-text-spring');
    expect(firstLetter).toHaveClass('bg-clip-text');
    expect(firstLetter).toHaveClass('text-transparent');
  });

  it('renders rest with inverse text color', () => {
    render(<BrandWordmark season="winter" />);

    expect(screen.getByText('Крайности')).toHaveClass('text-text-inverse');
  });

  it('applies nav size and interactive hover classes', () => {
    render(
      <span className="group">
        <BrandWordmark season="summer" size="nav" interactive />
      </span>
    );

    const firstLetter = screen.getAllByText('В')[0];
    expect(firstLetter.closest('.font-brand-wordmark')).toHaveClass('text-brand-wordmark-nav');
    expect(firstLetter).toHaveClass('group-hover:opacity-0');
    expect(firstLetter.parentElement?.querySelector('[aria-hidden]')).toHaveClass(
      'group-hover:opacity-100',
      'text-brand-secondary'
    );
    expect(screen.getByText('Крайности')).toHaveClass('group-hover:text-brand-secondary');
  });
});
