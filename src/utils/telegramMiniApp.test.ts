import { describe, expect, it } from 'vitest';
import { truncateTelegramTourDescription } from './telegramMiniApp';

describe('truncateTelegramTourDescription', () => {
  it('keeps short descriptions unchanged', () => {
    expect(truncateTelegramTourDescription('Короткий текст')).toBe('Короткий текст');
  });

  it('truncates long descriptions with ellipsis', () => {
    const longText = 'А'.repeat(500);
    const result = truncateTelegramTourDescription(longText, 40);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(40);
  });
});
