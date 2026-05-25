import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TeamHeroSection from './TeamHeroSection';
import { TEAM } from '../../data/teamData';
import { TEAM_HERO_TEXT_STAGGER_CLASS } from '../../constants/teamHeroAnimation';
import { UI } from '../../constants/ui';
import { splitTeamBioParagraphs } from '../../utils/team/splitTeamBioParagraphs';
import { SeasonProvider } from '../../context/SeasonContext';

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

function renderTeamHeroSection() {
  return render(
    <MemoryRouter>
      <SeasonProvider>
        <TeamHeroSection />
      </SeasonProvider>
    </MemoryRouter>
  );
}

describe('TeamHeroSection', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders both founders and section heading with aria-labelledby', () => {
    renderTeamHeroSection();

    const section = document.getElementById('team');
    expect(section).toHaveAttribute('aria-labelledby', 'team-heading');

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveAttribute('id', 'team-heading');
    expect(heading).toHaveTextContent(/Команда/);
    expect(heading).toHaveTextContent('В');
    expect(heading).toHaveTextContent('Крайности');

    expect(screen.getByRole('heading', { level: 3, name: TEAM[0].name })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: TEAM[1].name })).toBeInTheDocument();
    expect(screen.getByText(UI.sections.teamSub)).toBeInTheDocument();
  });

  it('renders all bio paragraphs for both team members', () => {
    renderTeamHeroSection();

    for (const member of TEAM) {
      for (const paragraph of splitTeamBioParagraphs(member.bio)) {
        expect(screen.getByText(paragraph)).toBeInTheDocument();
      }
    }
  });

  it('does not render carousel controls or details button', () => {
    renderTeamHeroSection();

    expect(screen.queryByRole('button', { name: /слайд команды/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Предыдущий слайд команды/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Следующий слайд команды/i })).not.toBeInTheDocument();
    expect(document.querySelector('[aria-roledescription="carousel"]')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Подробнее/i })).not.toBeInTheDocument();
  });

  it('renders members in display order: Elina first, Yaroslav second', () => {
    renderTeamHeroSection();

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Элина');
    expect(headings[1]).toHaveTextContent('Ярослав');
  });

  it('uses overflow-visible stack wrapper with tokenized member gap', () => {
    renderTeamHeroSection();

    const stack = screen.getByRole('heading', { level: 3, name: 'Элина' }).closest('section')
      ?.querySelector('.gap-team-hero-members-stack-mobile');

    expect(stack).toHaveClass('relative');
    expect(stack).toHaveClass('overflow-visible');
    expect(stack).toHaveClass('flex');
    expect(stack).toHaveClass('flex-col');
    expect(stack).toHaveClass('team-hero-desktop:gap-team-hero-members');
    expect(stack).toHaveClass('lg:gap-team-hero-members-lg');
  });

  it('aligns Yaroslav text row to end on team-hero-desktop without affecting Elina', () => {
    renderTeamHeroSection();

    const yaroslavSlide = document.getElementById('team-1-name')?.closest('article')?.firstElementChild;
    const elinaSlide = document.getElementById('team-2-name')?.closest('article')?.firstElementChild;

    expect(yaroslavSlide?.className).toContain('team-hero-desktop:grid-cols-[minmax(0,1fr)_auto]');
    expect(yaroslavSlide?.className).toContain('team-hero-desktop:items-end');
    expect(yaroslavSlide?.className).not.toContain('team-hero-desktop:items-start');
    expect(elinaSlide?.className).toContain('team-hero-desktop:grid-cols-[auto_minmax(0,1fr)]');
    expect(elinaSlide?.className).toContain('team-hero-desktop:items-start');
    expect(elinaSlide?.className).not.toContain('team-hero-desktop:items-end');
  });

  it('applies bottom padding on first member article from team-hero-desktop for staircase gap', () => {
    renderTeamHeroSection();

    const elinaArticle = screen.getByRole('heading', { level: 3, name: 'Элина' }).closest('article');
    const yaroslavArticle = screen.getByRole('heading', { level: 3, name: 'Ярослав' }).closest('article');

    expect(elinaArticle).toHaveClass('team-hero-desktop:pb-team-hero-first-member-bottom-sm');
    expect(elinaArticle).toHaveClass('md:pb-team-hero-first-member-bottom-md');
    expect(elinaArticle).toHaveClass('lg:pb-team-hero-first-member-bottom-lg');
    expect(yaroslavArticle).not.toHaveClass('team-hero-desktop:pb-team-hero-first-member-bottom-sm');
  });

  it('applies text stagger after scroll reveal', () => {
    renderTeamHeroSection();

    const yaroslavName = screen.getByRole('heading', { level: 3, name: TEAM[0].name });
    const elinaName = screen.getByRole('heading', { level: 3, name: TEAM[1].name });

    expect(yaroslavName).toHaveClass(TEAM_HERO_TEXT_STAGGER_CLASS);
    expect(yaroslavName.style.animationDelay).toBe('0ms');
    expect(elinaName).toHaveClass(TEAM_HERO_TEXT_STAGGER_CLASS);
    expect(elinaName.style.animationDelay).toBe('0ms');
  });

  it('renders each member in an article with aria-labelledby on name', () => {
    renderTeamHeroSection();

    for (const member of TEAM) {
      const nameHeading = screen.getByRole('heading', { level: 3, name: member.name });
      const article = nameHeading.closest('article');
      expect(article).toHaveAttribute('aria-labelledby', `${member.id}-name`);
      expect(nameHeading).toHaveAttribute('id', `${member.id}-name`);
    }
  });
});
