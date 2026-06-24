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
  const { runDataSsg } = await server.ssrLoadModule('/scripts/lib/runDataSsg.ts');
  await runDataSsg();
} finally {
  await server.close();
}
