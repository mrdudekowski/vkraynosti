import { describe, expect, it } from 'vitest';
import { transformSafetyStatusIconSvg } from './transformSafetyStatusIconSvg';
import { parseSanitizedSafetyStatusIconSvg } from './sanitizeSafetyStatusIconSvg';

const SAMPLE_SVG = `<svg viewBox="0 0 10 10">
<path d="M0 0" style="fill:rgb(3,4,4);"/>
<path d="M1 1" style="fill:white;"/>
</svg>`;

describe('parseSanitizedSafetyStatusIconSvg', () => {
  it('returns svg element for transformed markup', () => {
    const markup = transformSafetyStatusIconSvg(SAMPLE_SVG, {
      gradientId: 'test-grad',
      season: 'spring',
      solidHighlight: false,
    });
    const svg = parseSanitizedSafetyStatusIconSvg(markup);

    expect(svg).not.toBeNull();
    expect(svg?.tagName.toLowerCase()).toBe('svg');
    expect(svg?.querySelector('linearGradient#test-grad')).not.toBeNull();
    expect(svg?.querySelectorAll('path')).toHaveLength(2);
    const outline = svg?.querySelector('path[stroke]');
    expect(outline?.getAttribute('fill')).toBe('none');
    expect(outline?.getAttribute('stroke')).toBe('#030404');
  });

  it('strips script and event handler attributes', () => {
    const malicious = `<svg viewBox="0 0 10 10">
<script>alert(1)</script>
<path onclick="alert(1)" href="javascript:alert(1)" d="M0 0" style="fill:white;"/>
</svg>`;
    const svg = parseSanitizedSafetyStatusIconSvg(malicious);

    expect(svg).not.toBeNull();
    expect(svg?.querySelector('script')).toBeNull();
    const path = svg?.querySelector('path');
    expect(path?.getAttribute('onclick')).toBeNull();
    expect(path?.getAttribute('href')).toBeNull();
    expect(path?.getAttribute('d')).toBe('M0 0');
  });

  it('returns null for invalid markup', () => {
    expect(parseSanitizedSafetyStatusIconSvg('<div>not svg</div>')).toBeNull();
    expect(parseSanitizedSafetyStatusIconSvg('not xml')).toBeNull();
  });
});
