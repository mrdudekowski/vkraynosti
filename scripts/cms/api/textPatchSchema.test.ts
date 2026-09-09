/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { cmsProgramPatchStepSchema } from '../../../src/cms/cmsProgramPatchStep';

describe('textPatchSchema', () => {
  it('preserves the program day when parsing an admin save patch', () => {
    const parsed = cmsProgramPatchStepSchema.parse({
      day: 2,
      timeLabel: '09:00',
      description: 'Маршрут',
    });

    expect(parsed).toEqual({ day: 2, timeLabel: '09:00', description: 'Маршрут' });
  });
});
