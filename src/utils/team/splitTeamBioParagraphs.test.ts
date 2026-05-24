import { describe, expect, it } from 'vitest';
import { splitTeamBioParagraphs } from './splitTeamBioParagraphs';

describe('splitTeamBioParagraphs', () => {
  it('splits bio on blank lines', () => {
    expect(splitTeamBioParagraphs('First.\n\nSecond.')).toEqual(['First.', 'Second.']);
  });

  it('trims whitespace and drops empty blocks', () => {
    expect(splitTeamBioParagraphs('  One.  \n\n\n  Two.  ')).toEqual(['One.', 'Two.']);
  });

  it('returns a single paragraph when no separator is present', () => {
    expect(splitTeamBioParagraphs('Only one block.')).toEqual(['Only one block.']);
  });
});
