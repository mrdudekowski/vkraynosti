import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SafetyOfferContent from './SafetyOfferContent';
import { SAFETY_OFFER_SECTIONS } from '../../data/safetyOfferContent';

describe('SafetyOfferContent', () => {
  it('renders major offer sections without executor table or participant form', () => {
    render(<SafetyOfferContent />);

    expect(SAFETY_OFFER_SECTIONS.length).toBeGreaterThanOrEqual(19);
    expect(screen.getByRole('heading', { name: /2\. Общие положения/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /20\. Подтверждение ознакомления/ })).toBeInTheDocument();
    expect(screen.queryByText(/Форма подтверждения для участника/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ОГРНИП/)).not.toBeInTheDocument();
  });
});
