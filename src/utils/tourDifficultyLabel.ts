import { UI } from '../constants/ui';
import type { Tour } from '../types';

export type TourDifficultyLevel = Tour['difficulty'];

type TourDifficultyLabelSource = Pick<Tour, 'difficulty' | 'difficultyDisplayLabel'>;

/** Диапазон уровней сложности из `UI.difficulty.labels` (напр. «Лёгкий / Сложный»). */
export const formatDifficultyRangeLabel = (
  ...levels: TourDifficultyLevel[]
): string =>
  levels
    .map(level => UI.difficulty.labels[level])
    .join(UI.tourCard.metaAudienceDifficultyRangeSeparator);

/** Подпись сложности для карточки, мета-блока и SEO (если задан кастомный текст или диапазон). */
export const resolveTourDifficultyLabel = ({
  difficulty,
  difficultyDisplayLabel,
}: TourDifficultyLabelSource): string =>
  difficultyDisplayLabel ?? UI.difficulty.labels[difficulty];

export const hasCustomTourDifficultyLabel = ({
  difficultyDisplayLabel,
}: Pick<Tour, 'difficultyDisplayLabel'>): boolean =>
  difficultyDisplayLabel != null && difficultyDisplayLabel.length > 0;
