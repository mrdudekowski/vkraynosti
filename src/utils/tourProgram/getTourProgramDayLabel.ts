import type { TourProgramStep } from '../../types';

export function getTourProgramDayLabel(step: TourProgramStep): string {
  return `День ${step.day ?? 1}`;
}
