const TOUR_PRICE_FROM_PREFIX = /^от\s+/i;
const TOUR_PRICE_SUFFIX = /₽$/;

const numericPrice = (value: string): string | null => {
  const withoutCurrency = value.replace(TOUR_PRICE_SUFFIX, '').trim();
  if (!/^\d[\d\s]*$/.test(withoutCurrency)) {
    return null;
  }

  return `${withoutCurrency} ₽`;
};

export interface NormalizedTourPrice {
  price: string;
  priceFrom: boolean;
}

export function isNumericTourPrice(value: string): boolean {
  return numericPrice(value) != null;
}

export function normalizeTourPrice(value: string): NormalizedTourPrice {
  const trimmed = value.trim();
  const legacyFrom = TOUR_PRICE_FROM_PREFIX.test(trimmed);
  const withoutFrom = legacyFrom ? trimmed.replace(TOUR_PRICE_FROM_PREFIX, '') : trimmed;
  const normalizedNumeric = numericPrice(withoutFrom);

  if (normalizedNumeric != null) {
    return { price: normalizedNumeric, priceFrom: legacyFrom };
  }

  return { price: trimmed, priceFrom: false };
}

export function formatTourDisplayPrice(value: string, priceFrom = false): string {
  const normalized = normalizeTourPrice(value);
  if ((normalized.priceFrom || priceFrom) && isNumericTourPrice(normalized.price)) {
    return `от ${normalized.price}`;
  }

  return normalized.price;
}
