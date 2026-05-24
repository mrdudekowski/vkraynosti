import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TeamHeroSection from './TeamHeroSection';
import { TEAM } from '../../data/teamData';
import { TEAM_HERO_TEXT_STAGGER_CLASS } from '../../constants/teamHeroAnimation';
import { getTeamSectionHeading, UI } from '../../constants/ui';
import { splitTeamBioParagraphs } from '../../utils/team/splitTeamBioParagraphs';
import { SeasonProvider } from '../../context/SeasonContext';

describe('TeamHeroSection', () => {
  it('renders founder names and carousel region', () => {
    render(
      <MemoryRouter>
        <SeasonProvider>
          <TeamHeroSection />
        </SeasonProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('region', { name: getTeamSectionHeading() })).toHaveAttribute(
      'aria-roledescription',
      'carousel'
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent(/Команда/);
    expect(heading).toHaveTextContent('В');
    expect(heading).toHaveTextContent('Крайности');
    expect(screen.getByText('Ярослав')).toBeInTheDocument();
    expect(screen.getByText(UI.sections.teamSub)).toBeInTheDocument();
  });

  it('renders all bio paragraphs for the active slide', () => {
    render(
      <MemoryRouter>
        <SeasonProvider>
          <TeamHeroSection />
        </SeasonProvider>
      </MemoryRouter>
    );

    for (const paragraph of splitTeamBioParagraphs(TEAM[0].bio)) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it('renders pagination dots without a details button', () => {
    render(
      <MemoryRouter>
        <SeasonProvider>
          <TeamHeroSection />
        </SeasonProvider>
      </MemoryRouter>
    );

    const dots = screen.getAllByRole('button', {
      name: /Перейти к слайду команды/i,
    });
    expect(dots).toHaveLength(TEAM.length);
    expect(screen.queryByRole('button', { name: /Подробнее/i })).not.toBeInTheDocument();
  });

  it('remounts slide with cascade stagger when switching team members', () => {
    render(
      <MemoryRouter>
        <SeasonProvider>
          <TeamHeroSection />
        </SeasonProvider>
      </MemoryRouter>
    );

    const yaroslavName = screen.getByRole('heading', { level: 3, name: TEAM[0].name });
    expect(yaroslavName).toHaveClass(TEAM_HERO_TEXT_STAGGER_CLASS);
    expect(yaroslavName.style.animationDelay).toBe('0ms');

    const secondDot = screen.getByRole('button', {
      name: UI.team.carouselPaginationGoToSlide.replace('{n}', '2'),
    });
    fireEvent.click(secondDot);

    const elinaName = screen.getByRole('heading', { level: 3, name: TEAM[1].name });
    expect(elinaName).toHaveClass(TEAM_HERO_TEXT_STAGGER_CLASS);
    expect(elinaName.style.animationDelay).toBe('0ms');
    expect(screen.queryByRole('heading', { level: 3, name: TEAM[0].name })).not.toBeInTheDocument();
  });
});
