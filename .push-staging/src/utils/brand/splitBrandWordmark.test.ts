import { describe, expect, it } from 'vitest';
import { splitBrandWordmark } from './splitBrandWordmark';
import { UI } from '../../constants/ui';

describe('splitBrandWordmark', () => {
  it('splits the canonical brand wordmark', () => {
    expect(splitBrandWordmark(UI.nav.brand)).toEqual({
      firstLetter: 'В',
      rest: 'Крайности',
    });
  });

  it('returns empty rest for a single character', () => {
    expect(splitBrandWordmark('В')).toEqual({
      firstLetter: 'В',
      rest: '',
    });
  });
});
