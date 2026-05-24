import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TeamMemberHeroSlide from './TeamMemberHeroSlide';
import { TEAM } from '../../data/teamData';
import { TEAM_HERO_TEXT_STAGGER_CLASS } from '../../constants/teamHeroAnimation';
import { splitTeamBioParagraphs } from '../../utils/team/splitTeamBioParagraphs';

describe('TeamMemberHeroSlide', () => {
  it('shows portrait after image load', () => {
    render(<TeamMemberHeroSlide member={TEAM[0]} prefersReducedMotion />);

    const img = screen.getByRole('img', { name: TEAM[0].name });
    expect(img).toHaveAttribute('src', TEAM[0].imageUrl);
    expect(img).toHaveClass('opacity-0');
    expect(img).toHaveClass('max-h-team-hero-portrait-mobile');
    expect(img).toHaveClass('w-auto');
    expect(img).not.toHaveClass('w-full');
    expect(img).not.toHaveClass('object-cover');

    fireEvent.load(img);

    expect(img).toHaveClass('opacity-100');
  });

  it('uses intrinsic portrait layout with sm grid and centered block', () => {
    const { container } = render(
      <TeamMemberHeroSlide member={TEAM[1]} prefersReducedMotion />
    );

    const portraitFrame = container.querySelector('.rounded-card');
    expect(portraitFrame).toHaveClass('w-fit');
    expect(portraitFrame).toHaveClass('max-w-full');
    expect(portraitFrame).not.toHaveClass('w-full');
    expect(portraitFrame).not.toHaveClass('h-team-hero-portrait-mobile');

    const slideRoot = container.firstElementChild;
    expect(slideRoot?.className).toContain('sm:grid-cols-[auto_minmax(0,1fr)]');
    expect(slideRoot?.className).toContain('sm:mx-auto');
    expect(slideRoot?.className).toContain('sm:w-full');
    expect(slideRoot?.className).toContain('sm:max-w-team-hero-slide');
    expect(slideRoot?.className).not.toContain('sm:w-fit');
  });

  it('applies cascade stagger delays for Yaroslav', () => {
    render(<TeamMemberHeroSlide member={TEAM[0]} prefersReducedMotion={false} />);

    const name = screen.getByRole('heading', { level: 3, name: TEAM[0].name });
    const role = screen.getByText(TEAM[0].role);
    const [bioParagraph] = splitTeamBioParagraphs(TEAM[0].bio);
    const bio = screen.getByText(bioParagraph);

    expect(name).toHaveClass(TEAM_HERO_TEXT_STAGGER_CLASS);
    expect(name.style.animationDelay).toBe('0ms');
    expect(role.style.animationDelay).toBe('80ms');
    expect(bio.style.animationDelay).toBe('160ms');
    expect(screen.queryByText(new RegExp(TEAM[0].experience!))).not.toBeInTheDocument();
  });

  it('skips experience in cascade index for Elina', () => {
    render(<TeamMemberHeroSlide member={TEAM[1]} prefersReducedMotion={false} />);

    const name = screen.getByRole('heading', { level: 3, name: TEAM[1].name });
    const [bioParagraph] = splitTeamBioParagraphs(TEAM[1].bio);
    const bio = screen.getByText(bioParagraph);

    expect(name.style.animationDelay).toBe('0ms');
    expect(bio.style.animationDelay).toBe('160ms');
  });

  it('does not apply stagger when reduced motion is preferred', () => {
    render(<TeamMemberHeroSlide member={TEAM[0]} prefersReducedMotion />);

    const name = screen.getByRole('heading', { level: 3, name: TEAM[0].name });
    const role = screen.getByText(TEAM[0].role);
    const [bioParagraph] = splitTeamBioParagraphs(TEAM[0].bio);
    const bio = screen.getByText(bioParagraph);

    expect(name).not.toHaveClass(TEAM_HERO_TEXT_STAGGER_CLASS);
    expect(role).not.toHaveClass(TEAM_HERO_TEXT_STAGGER_CLASS);
    expect(bio).not.toHaveClass(TEAM_HERO_TEXT_STAGGER_CLASS);
    expect(name.style.animationDelay).toBe('');
    expect(role.style.animationDelay).toBe('');
    expect(bio.style.animationDelay).toBe('');
  });

  it('places name and role in the text column, not on the portrait', () => {
    const { container } = render(
      <TeamMemberHeroSlide member={TEAM[1]} prefersReducedMotion />
    );

    const portraitFrame = container.querySelector('.rounded-card');
    expect(portraitFrame?.querySelector('h3')).toBeNull();
    expect(portraitFrame?.textContent).not.toContain(TEAM[1].role);

    const name = screen.getByRole('heading', { level: 3, name: TEAM[1].name });
    const role = screen.getByText(TEAM[1].role);
    const [bioParagraph] = splitTeamBioParagraphs(TEAM[1].bio);
    const bio = screen.getByText(bioParagraph);

    expect(name.compareDocumentPosition(bio) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(role.compareDocumentPosition(bio) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByText(TEAM[1].role)).toHaveLength(1);
  });

  it('renders bio paragraphs in the text column', () => {
    render(<TeamMemberHeroSlide member={TEAM[0]} prefersReducedMotion />);

    const [firstParagraph] = splitTeamBioParagraphs(TEAM[0].bio);
    expect(screen.getByText(firstParagraph)).toBeInTheDocument();
  });
});
