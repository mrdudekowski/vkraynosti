import type { TourProgramStep } from '../../types';

export function hasMultipleTourProgramDays(program: readonly TourProgramStep[]): boolean {
  return program.some((step) => (step.day ?? 1) > 1);
}
