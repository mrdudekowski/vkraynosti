/** Подмена базового пути тура в URL медиа (`/tours/spring-10/…` → `/tours/fall-10/…`). */
export function remapTourMediaUrls(
  urls: readonly string[],
  fromTourId: string,
  toTourId: string
): string[] {
  const fromSegment = `/tours/${fromTourId}/`;
  const toSegment = `/tours/${toTourId}/`;
  return urls.map((url) => url.replace(fromSegment, toSegment));
}

export function remapPosterMap(
  posters: Record<string, string>,
  fromTourId: string,
  toTourId: string
): Record<string, string> {
  const fromSegment = `/tours/${fromTourId}/`;
  const toSegment = `/tours/${toTourId}/`;
  return Object.fromEntries(
    Object.entries(posters).map(([gridSrc, posterSrc]) => [
      gridSrc.replace(fromSegment, toSegment),
      posterSrc.replace(fromSegment, toSegment),
    ])
  );
}
