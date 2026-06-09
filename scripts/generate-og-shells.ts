import { createServer } from 'vite';
import { setupOgShellBuildEnv } from './lib/ogShellEnv.ts';

setupOgShellBuildEnv();

const rootDir = process.cwd();
const server = await createServer({
  root: rootDir,
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const { runGenerateOgShells } = await server.ssrLoadModule('/scripts/lib/runGenerateOgShells.ts');
  await runGenerateOgShells();
} finally {
  await server.close();
}
