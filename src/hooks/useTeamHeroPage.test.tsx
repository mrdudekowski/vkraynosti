import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

let useTeamHeroPage: typeof import('./useTeamHeroPage').useTeamHeroPage;

beforeAll(async () => {
  vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', 'https://cdn.example.com/');
  useTeamHeroPage = (await import('./useTeamHeroPage')).useTeamHeroPage;
});

vi.mock('../context/SiteContentContext', () => ({
  useSiteContent: () => ({
    team: {
      kind: 'team',
      schemaVersion: 1,
      members: [
        {
          id: 'team-2',
          name: 'Элина',
          photo: {
            assetId: 'team-2',
            url: '/team/team-2.webp',
            mimeType: 'image/webp',
            alt: 'Элина',
          },
          role: '',
          roleVisible: true,
          experience: '',
          experienceVisible: false,
          bio: '',
          bioVisible: true,
          order: 0,
        },
      ],
    },
  }),
}));

function Probe() {
  const { currentPair } = useTeamHeroPage();
  return <output data-testid="team-image-url">{currentPair[0]?.imageUrl}</output>;
}

describe('useTeamHeroPage', () => {
  it('resolves relative CMS team photo URLs through the public media base', () => {
    render(<Probe />);

    expect(screen.getByTestId('team-image-url')).toHaveTextContent(
      'https://cdn.example.com/team/team-2.webp',
    );
  });
});
