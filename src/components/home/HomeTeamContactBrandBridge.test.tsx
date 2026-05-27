import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VKRAI_FOREST_LOGO } from '../../constants/images';
import HomeTeamContactBrandBridge from './HomeTeamContactBrandBridge';

vi.mock('../../context/useSeason', () => ({
  useSeason: () => ({ activeSeason: 'spring' }),
}));

vi.mock('../../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => true,
}));

describe('HomeTeamContactBrandBridge', () => {
  it('renders decorative VKRAI mark without action links', () => {
    const { container } = render(<HomeTeamContactBrandBridge />);

    const img = container.querySelector(`img[src="${VKRAI_FOREST_LOGO}"]`);
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('aria-hidden', 'true');

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();

    const section = container.querySelector('[data-home-team-contact-bridge]');
    expect(section?.className).not.toMatch(/bg-home-page-sky-/);
    expect(section?.className).not.toContain('bg-home-gate-start-screen');
  });
});
