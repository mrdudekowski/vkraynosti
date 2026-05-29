import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TourDetailMetaFacts from './TourDetailMetaFacts';
import { UI } from '../../constants/ui';

describe('TourDetailMetaFacts', () => {
  it('shows one-day catalog label in duration block', () => {
    render(
      <TourDetailMetaFacts
        displayDuration={UI.tourDetail.durationDisplayOneDay}
        difficulty="Easy"
      />
    );

    expect(screen.getByText(UI.tourDetail.durationDisplayOneDay)).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        `${UI.tourDetail.metaLabelDuration}: ${UI.tourDetail.durationDisplayOneDay}`
      )
    ).toBeInTheDocument();
  });

  it('shows multi-day catalog label in duration block', () => {
    render(
      <TourDetailMetaFacts
        displayDuration={UI.tourDetail.durationDisplayMultiDay}
        difficulty="Medium"
      />
    );

    expect(screen.getByText(UI.tourDetail.durationDisplayMultiDay)).toBeInTheDocument();
  });
});
