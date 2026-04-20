const LEADING_DASH_PATTERN = /^\s*[—-]\s*/;
const SENTENCE_SPLIT_PATTERN = /(?<=[.!?])\s+/;
const CLAUSE_SPLIT_PATTERN = /(?<=,)\s+/;

type DescriptionColumns = {
  primaryText: string;
  asideText: string | null;
};

function normalizeDescriptionText(rawDescription: string): string {
  return rawDescription.trim().replace(LEADING_DASH_PATTERN, "");
}

function splitByTargetLength(units: string[]): DescriptionColumns {
  if (units.length < 2) {
    return { primaryText: units[0] ?? "", asideText: null };
  }

  const unitLengths = units.map((unit) => unit.length);
  const totalLength = unitLengths.reduce((sum, length) => sum + length, 0);

  // Правая колонка должна быть содержательной, иначе разбиение визуально бессмысленно.
  const minimumAsideLength = Math.max(36, Math.floor(totalLength * 0.22));
  const targetLeftShare = 0.55;
  const targetLeftLength = totalLength * targetLeftShare;

  let bestSplitIndex = -1;
  let bestScore = Number.POSITIVE_INFINITY;
  let leftLength = 0;

  for (let index = 0; index < units.length - 1; index += 1) {
    leftLength += unitLengths[index];
    const rightLength = totalLength - leftLength;
    if (rightLength < minimumAsideLength) continue;

    // Левый текст должен быть чуть больше (но не слишком).
    const isLeftPreferred = leftLength >= rightLength;
    const lengthDelta = Math.abs(leftLength - targetLeftLength);
    const balancePenalty = isLeftPreferred ? 0 : totalLength;
    const score = lengthDelta + balancePenalty;

    if (score < bestScore) {
      bestScore = score;
      bestSplitIndex = index;
    }
  }

  if (bestSplitIndex < 0) {
    bestSplitIndex = Math.max(0, Math.floor(units.length / 2) - 1);
  }

  const primaryText = units.slice(0, bestSplitIndex + 1).join(" ").trim();
  const asideText = units.slice(bestSplitIndex + 1).join(" ").trim();
  return {
    primaryText: primaryText.length > 0 ? primaryText : units.join(" ").trim(),
    asideText: asideText.length > 0 ? asideText : null,
  };
}

export function splitTourDescription(
  description: string,
  manualAside?: string
): DescriptionColumns {
  const normalizedDescription = normalizeDescriptionText(description);

  if (manualAside != null && manualAside.trim().length > 0) {
    return {
      primaryText: normalizedDescription,
      asideText: manualAside.trim(),
    };
  }

  const sentenceUnits = normalizedDescription
    .split(SENTENCE_SPLIT_PATTERN)
    .map((unit) => unit.trim())
    .filter((unit) => unit.length > 0);

  if (sentenceUnits.length >= 2) {
    return splitByTargetLength(sentenceUnits);
  }

  const clauseUnits = normalizedDescription
    .split(CLAUSE_SPLIT_PATTERN)
    .map((unit) => unit.trim())
    .filter((unit) => unit.length > 0);

  if (clauseUnits.length >= 2) {
    return splitByTargetLength(clauseUnits);
  }

  return { primaryText: normalizedDescription, asideText: null };
}
