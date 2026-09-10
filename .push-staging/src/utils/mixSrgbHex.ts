import { parseHexColor } from './colorContrast';

/**
 * Смешивание двух непрозрачных sRGB-цветов (аналог `color-mix(in srgb, a X%, b Y%)`).
 * Проценты нормализуются, если их сумма не равна 100.
 */
export function mixSrgbHex(
  colorAHex: string,
  percentA: number,
  colorBHex: string,
  percentB: number
): string {
  const total = percentA + percentB;
  if (total <= 0) {
    throw new Error('mixSrgbHex: sum of mix percentages must be positive');
  }
  const weightA = percentA / total;
  const weightB = percentB / total;
  const [rA, gA, bA] = parseHexColor(colorAHex);
  const [rB, gB, bB] = parseHexColor(colorBHex);

  const channel = (a: number, b: number) =>
    Math.round(Math.min(255, Math.max(0, a * weightA + b * weightB)));

  const r = channel(rA, rB);
  const g = channel(gA, gB);
  const b = channel(bA, bB);

  return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
}
