export function validateCmsRuntimeBase(env = process.env) {
  const value = env.VITE_CMS_S3_BASE_URL?.trim();
  if (!value) throw new Error('VITE_CMS_S3_BASE_URL is required for the public CMS runtime');

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('VITE_CMS_S3_BASE_URL must be an absolute HTTPS URL');
  }

  if (url.protocol !== 'https:') throw new Error('VITE_CMS_S3_BASE_URL must use HTTPS');
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('VITE_CMS_S3_BASE_URL must not contain credentials, a query, or a fragment');
  }
  return url.toString().replace(/\/+$/, '');
}

export async function validateCmsRuntimeCors(env = process.env, fetchImpl = fetch) {
  const baseUrl = validateCmsRuntimeBase(env);
  const siteOrigin = 'https://vkraynosti.ru';
  let response;
  try {
    response = await fetchImpl(`${baseUrl}/published/tours.json`, {
      cache: 'no-store',
      headers: { Origin: siteOrigin },
    });
  } catch (error) {
    throw new Error(`Cannot reach live CMS catalog at ${baseUrl}: ${error.message}`);
  }
  if (!response.ok) throw new Error(`Live CMS catalog probe failed (${response.status}) at ${baseUrl}`);

  const allowedOrigin = response.headers.get('access-control-allow-origin');
  if (allowedOrigin !== '*' && allowedOrigin !== siteOrigin) {
    throw new Error(`CMS runtime URL must allow ${siteOrigin}; received ${allowedOrigin ?? 'no CORS header'}`);
  }
  return baseUrl;
}
