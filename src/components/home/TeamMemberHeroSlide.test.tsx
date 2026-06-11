import { describe, expect, it, vi, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TeamMemberHeroSlide from './TeamMemberHeroSlide';
import { TEAM } from '../../data/teamData';
import { TEAM_HERO_TEXT_STAGGER_CLASS } from '../../constants/teamHeroAnimation';
import { splitTeamBioParagraphs } from '../../utils/team/splitTeamBioParagraphs';

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];
  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element) {
    this.callback(
      [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
      this
    );
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

class NoIntersectObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

describe('TeamMemberHeroSlide', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it('uses intrinsic portrait layout with team-hero-desktop grid and centered block', () => {
    const { container } = render(
      <TeamMemberHeroSlide member={TEAM[1]} prefersReducedMotion />
    );

    const portraitFrame = container.querySelector('.rounded-card');
    expect(portraitFrame).toHaveClass('w-fit');
    expect(portraitFrame).toHaveClass('max-w-full');
    expect(portraitFrame).not.toHaveClass('w-full');
    expect(portraitFrame).not.toHaveClass('h-team-hero-portrait-mobile');

    const slideRoot = container.querySelector('article > div');
    expect(slideRoot?.className).toContain('team-hero-desktop:grid-cols-[auto_minmax(0,1fr)]');
    expect(slideRoot?.className).toContain('team-hero-desktop:mx-auto');
    expect(slideRoot?.className).toContain('team-hero-desktop:w-full');
    expect(slideRoot?.className).toContain('team-hero-desktop:max-w-team-hero-slide');
    expect(slideRoot?.className).not.toContain('team-hero-desktop:w-fit');
  });

  it('hides text with opacity-0 before scroll reveal', () => {
    vi.stubGlobal('IntersectionObserver', NoIntersectObserver);

    render(<TeamMemberHeroSlide member={TEAM[0]} prefersReducedMotion={false} />);

    const name = screen.getByRole('heading', { level: 3, name: TEAM[0].name });
    expect(name).toHaveClass('opacity-0');
    expect(name).not.toHaveClass(TEAM_HERO_TEXT_STAGGER_CLASS);
  });

  it('applies cascade stagger delays after scroll reveal', () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

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
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

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

  it('uses standard Tailwind spacing and typography on mobile text block', () => {
    const { container } = render(
      <TeamMemberHeroSlide member={TEAM[1]} prefersReducedMotion />
    );

    const textColumn = container.querySelector('[id="team-2-name"]')?.parentElement?.parentElement;
    expect(textColumn?.className).toContain('px-4');
    expect(textColumn?.className).toContain('py-4');
    expect(textColumn?.className).not.toContain('max-team-hero-below-desktop:px-4');
    expect(textColumn?.className).toContain('team-hero-desktop:pb-8');

    const textStack = container.querySelector('.space-y-4');
    expect(textStack).toBeInTheDocument();
    expect(textStack?.className).toContain('team-hero-desktop:space-y-3');

    const [bioParagraph] = splitTeamBioParagraphs(TEAM[1].bio);
    const bio = screen.getByText(bioParagraph);
    expect(bio.className).toContain('leading-team-hero-bio');
    expect(bio.className).toContain('team-hero-desktop:leading-team-hero-bio');
    expect(bio.className).toContain('md:leading-team-hero-bio');
    expect(bio.className).toContain('lg:leading-team-hero-bio');

    const name = screen.getByRole('heading', { level: 3, name: TEAM[1].name });
    expect(name.className).toContain('text-tour-detail-program-heading');
    expect(name.className).toContain('lg:text-tour-detail-section');
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

  it('mirrors photo to the right column on team-hero-desktop for photo-end', () => {
    const { container } = render(
      <TeamMemberHeroSlide member={TEAM[0]} prefersReducedMotion layoutVariant="photo-end" />
    );

    const slideRoot = container.querySelector('article > div');
    expect(slideRoot?.className).toContain('team-hero-desktop:grid-cols-[minmax(0,1fr)_auto]');
    expect(slideRoot?.className).toContain('team-hero-desktop:overflow-visible');

    const portraitFrame = container.querySelector('.rounded-card');
    const photoColumn = portraitFrame?.parentElement;
    expect(photoColumn?.className).toContain('team-hero-desktop:col-start-2');
    expect(photoColumn?.className).toContain('md:-mt-team-hero-staircase-offset-md');
    expect(photoColumn?.className).toContain('team-hero-desktop:z-10');
    expect(photoColumn?.className).not.toContain('team-hero-desktop:absolute');

    const textColumn = container.querySelector('[id="team-1-name"]')?.parentElement?.parentElement;
    expect(textColumn?.className).toContain('team-hero-desktop:col-start-1');
  });

  it('does not apply mirror or staircase classes to photo-start', () => {
    const { container } = render(
      <TeamMemberHeroSlide member={TEAM[1]} prefersReducedMotion layoutVariant="photo-start" />
    );

    const slideRoot = container.querySelector('article > div');
    expect(slideRoot?.className).not.toContain('team-hero-desktop:grid-cols-[minmax(0,1fr)_auto]');

    const portraitFrame = container.querySelector('.rounded-card');
    const photoColumn = portraitFrame?.parentElement;
    expect(photoColumn?.className).not.toContain('team-hero-desktop:absolute');
    expect(photoColumn?.className).not.toContain('md:-mt-team-hero-staircase-offset-md');
  });

  it('keeps Yaroslav portrait in document flow on photo-end', () => {
    render(<TeamMemberHeroSlide member={TEAM[0]} prefersReducedMotion layoutVariant="photo-end" />);

    const img = screen.getByRole('img', { name: TEAM[0].name });
    expect(img).toHaveAttribute('src', TEAM[0].imageUrl);
    expect(img.closest('.rounded-card')).toBeInTheDocument();
  });

  it('aligns photo-start grid and text column to row end on desktop for Yaroslav', () => {
    const { container } = render(
      <TeamMemberHeroSlide
        member={TEAM[0]}
        prefersReducedMotion
        layoutVariant="photo-start"
        desktopTextAlign="end"
      />
    );

    const slideRoot = container.querySelector('article > div');
    expect(slideRoot?.className).toContain('team-hero-desktop:items-end');
    expect(slideRoot?.className).not.toContain('team-hero-desktop:items-start');

    const textColumn = container.querySelector('[id="team-1-name"]')?.parentElement?.parentElement;
    expect(textColumn?.className).toContain('team-hero-desktop:pb-0');
    expect(textColumn?.className).not.toContain('team-hero-desktop:pb-8');
    expect(textColumn?.className).toContain('px-4');
    expect(textColumn?.className).toContain('py-4');
  });

  it('does not apply row-end alignment to photo-start without desktopTextAlign end', () => {
    const { container } = render(
      <TeamMemberHeroSlide member={TEAM[1]} prefersReducedMotion layoutVariant="photo-start" />
    );

    const slideRoot = container.querySelector('article > div');
    expect(slideRoot?.className).toContain('team-hero-desktop:items-start');
    expect(slideRoot?.className).not.toContain('team-hero-desktop:items-end');
  });

  it('aligns photo-end grid to row end when desktopTextAlign is end', () => {
    const { container } = render(
      <TeamMemberHeroSlide
        member={TEAM[0]}
        prefersReducedMotion
        layoutVariant="photo-end"
        desktopTextAlign="end"
      />
    );

    const slideRoot = container.querySelector('article > div');
    expect(slideRoot?.className).toContain('team-hero-desktop:items-end');
    expect(slideRoot?.className).not.toContain('team-hero-desktop:items-start');
  });
});
