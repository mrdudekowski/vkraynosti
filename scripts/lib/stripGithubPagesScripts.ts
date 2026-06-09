/** True when building for TimeWeb App (root base path, not GitHub Pages /vkraynosti/). */
export const isTimewebAppBuild = (env: NodeJS.ProcessEnv = process.env): boolean => {
  const base = (env.VITE_BASE_PATH || '/vkraynosti/').trim();
  return !base || base === '/';
};

/** Remove GitHub Pages SPA redirect restore script — not used on TimeWeb App. */
export const stripGithubPagesSpaRedirectScript = (html: string): string =>
  html.replace(/<script>\s*\/\/ GitHub Pages SPA:[\s\S]*?<\/script>\s*/gi, '');

/** Remove GitHub Pages 404 redirect script from public/404.html template. */
export const stripGithubPages404RedirectScript = (html: string): string =>
  html.replace(/<script>\s*\/\/ GitHub Pages SPA redirect:[\s\S]*?<\/script>\s*/gi, '');
