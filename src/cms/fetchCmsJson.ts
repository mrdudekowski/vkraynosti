export const CMS_FETCH_TIMEOUT_MS = 8_000;

export async function fetchCmsJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CMS_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error(`CMS fetch failed (${response.status}): ${url}`);
    return await response.json() as unknown;
  } finally {
    clearTimeout(timeout);
  }
}
