import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import AdminReadinessRing from './AdminReadinessRing';

describe('AdminReadinessRing', () => {
  it('shows card readiness as a percent', () => {
    render(<AdminReadinessRing ready={4} total={5} />);

    expect(screen.getByText(ADMIN_UI.editorReadinessCard)).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });
});
