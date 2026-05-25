import { describe, expect, it } from 'vitest';
import { transformSafetyStatusIconSvg } from './transformSafetyStatusIconSvg';

const SAMPLE_SVG = `<svg viewBox="0 0 10 10">
<path d="M0 0" style="fill:rgb(3,4,4);"/>
<path d="M1 1" style="fill:white;"/>
</svg>`;

describe('transformSafetyStatusIconSvg', () => {
  it('keeps dark fills and applies gradient to light fills', () => {
    const result = transformSafetyStatusIconSvg(SAMPLE_SVG, {
      gradientId: 'test-grad',
      season: 'spring',
      solidHighlight: false,
    });

    expect(result).toContain('fill:#030404');
    expect(result).toContain('fill:url(#test-grad)');
    expect(result).toContain('<linearGradient id="test-grad"');
    expect(result).toContain('stop-color="#C76B7E"');
  });

  it('uses solid accent for highlights when solidHighlight is true', () => {
    const result = transformSafetyStatusIconSvg(SAMPLE_SVG, {
      gradientId: 'test-grad',
      season: 'winter',
      solidHighlight: true,
    });

    expect(result).toContain('fill:#7BA7BC');
    expect(result).not.toContain('linearGradient');
  });
});
