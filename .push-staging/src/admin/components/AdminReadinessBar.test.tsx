import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ADMIN_UI } from '../constants/ui';
import { formatAdminReadiness } from '../formatAdminCopy';
import AdminReadinessBar from './AdminReadinessBar';

describe('AdminReadinessBar', () => {
  it('рисует линию готовности с долей и процентом', () => {
    render(<AdminReadinessBar ready={4} total={5} />);

    expect(screen.getByText(formatAdminReadiness(4, 5))).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: ADMIN_UI.editorReadinessCard })).toHaveAttribute(
      'aria-valuenow',
      '80',
    );
  });
});
