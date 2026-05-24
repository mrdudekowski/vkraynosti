import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * @returns {Promise<{ tours: { id: string; season: string; imageUrl: string }[]; baseUrl: string }>}
 */
export async function loadToursViaVite() {
  const server = await createServer({
    root: rootDir,
    logLevel: 'error',
    server: { middlewareMode: true },
  });

  try {
    const toursModule = await server.ssrLoadModule('/src/data/toursData.ts');
    const tours = toursModule.TOURS;
    if (!Array.isArray(tours)) {
      throw new Error('toursData.ts must export TOURS array');
    }
    const baseUrl = server.config.base ?? '/';
    return { tours, baseUrl };
  } finally {
    await server.close();
  }
}
