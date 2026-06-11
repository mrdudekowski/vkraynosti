import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TeamHeroSection from './TeamHeroSection';
import { TEAM, TEAM_HERO_PAGES } from '../../data/teamData';
import { TEAM_HERO_TEXT_STAGGER_CLASS } from '../../constants/teamHeroAnimation';
import { scrollHomeTeamTopImmediate } from '../../constants/smoothScroll';
import { UI } from '../../constants/ui';
import { splitTeamBioParagraphs } from '../../utils/team/splitTeamBioParagraphs';
import { SeasonProvider } from '../../context/SeasonContext';

vi.mock('lenis/react', () => ({
  useLenis: () => undefined,
}));

vi.mock('../../constants/smoothScroll', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../constants/smoothScroll')>();
  return {
    ...actual,
    scrollHomeTeamTopImmediate: vi.fn(),
  };
});

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
    vi.mocked(scrollHomeTeamTopImmediate).mockClear();
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

  it('renders bio paragraphs for the visible core team page only', () => {
    renderTeamHeroSection();

    for (const member of TEAM_HERO_PAGES[0]) {
      for (const paragraph of splitTeamBioParagraphs(member.bio)) {
        expect(screen.getByText(paragraph)).toBeInTheDocument();
      }
    }

    for (const paragraph of splitTeamBioParagraphs(TEAM[2].bio)) {
      expect(screen.queryByText(paragraph)).not.toBeInTheDocument();
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

    const stack = document.getElementById(UI.team.membersContainerId);

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

  it('applies bottom padding on first member article from md for staircase gap', () => {
    renderTeamHeroSection();

    const elinaArticle = screen.getByRole('heading', { level: 3, name: 'Элина' }).closest('article');
    const yaroslavArticle = screen.getByRole('heading', { level: 3, name: 'Ярослав' }).closest('article');

    expect(elinaArticle).toHaveClass('md:pb-team-hero-first-member-bottom-md');
    expect(elinaArticle).toHaveClass('lg:pb-team-hero-first-member-bottom-lg');
    expect(elinaArticle).not.toHaveClass('team-hero-desktop:pb-team-hero-first-member-bottom-sm');
    expect(yaroslavArticle).not.toHaveClass('md:pb-team-hero-first-member-bottom-md');
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

  it('renders each visible member in an article with aria-labelledby on name', () => {
    renderTeamHeroSection();

    for (const member of TEAM_HERO_PAGES[0]) {
      const nameHeading = screen.getByRole('heading', { level: 3, name: member.name });
      const article = nameHeading.closest('article');
      expect(article).toHaveAttribute('aria-labelledby', `${member.id}-name`);
      expect(nameHeading).toHaveAttribute('id', `${member.id}-name`);
    }
  });

  it('renders next page button with loop aria-label on core team page', () => {
    renderTeamHeroSection();

    const nextButton = screen.getByRole('button', { name: UI.team.nextTeamPageAriaLabel });
    expect(nextButton).toHaveAttribute('aria-controls', UI.team.membersContainerId);
    expect(nextButton).not.toHaveAttribute('aria-expanded');
  });

  it('advances to Elena and Pavel on next click without changing aria-label', async () => {
    const user = userEvent.setup();
    renderTeamHeroSection();

    await user.click(screen.getByRole('button', { name: UI.team.nextTeamPageAriaLabel }));

    expect(screen.getByRole('heading', { level: 3, name: 'Елена' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Павел' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: 'Ярослав' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: 'Элина' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: UI.team.nextTeamPageAriaLabel })).toBeInTheDocument();
    expect(scrollHomeTeamTopImmediate).toHaveBeenCalledTimes(1);
  });

  it('loops back to core team on second next click', async () => {
    const user = userEvent.setup();
    renderTeamHeroSection();

    const nextButton = screen.getByRole('button', { name: UI.team.nextTeamPageAriaLabel });
    await user.click(nextButton);
    await user.click(screen.getByRole('button', { name: UI.team.nextTeamPageAriaLabel }));

    expect(screen.getByRole('heading', { level: 3, name: 'Элина' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Ярослав' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: 'Елена' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: UI.team.nextTeamPageAriaLabel })).toBeInTheDocument();
    expect(scrollHomeTeamTopImmediate).toHaveBeenCalledTimes(2);
  });
});
