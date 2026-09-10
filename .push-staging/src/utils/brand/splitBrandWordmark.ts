export type BrandWordmarkParts = {
  firstLetter: string;
  rest: string;
};

/** Разбивает слово «Вкрайности» на сезонную первую букву и остаток с заглавной «К». */
export function splitBrandWordmark(wordmark: string): BrandWordmarkParts {
  const firstLetter = wordmark.slice(0, 1);
  const restRaw = wordmark.slice(1);
  const rest =
    restRaw.length === 0
      ? ''
      : restRaw[0].toLocaleUpperCase('ru-RU') + restRaw.slice(1);

  return { firstLetter, rest };
}
