import { readFile } from 'node:fs/promises';

import { resolve } from 'node:path';



const rootDir = resolve(import.meta.dirname, '..');



describe('SEO static shells', () => {

  it('keeps the boot splash hidden until the user-side runtime enables it', async () => {

    const html = await readFile(resolve(rootDir, 'index.html'), 'utf8');



    expect(html).toMatch(/id="app-boot-splash"[\s\S]*\shidden(?:\s|>)/i);

    expect(html).not.toMatch(/id="app-boot-splash"[\s\S]*role="progressbar"/i);

    expect(html).toContain('#app-boot-splash[hidden]');

  });



  it('provides a non-empty noindex 404 fallback', async () => {

    const html = await readFile(resolve(rootDir, 'public/404.html'), 'utf8');



    expect(html).toMatch(/<meta\s+name="robots"\s+content="noindex,nofollow"/i);

    expect(html).toMatch(/<body>[\s\S]*<main[\s\S]*Страница не найдена[\s\S]*<\/main>[\s\S]*<\/body>/i);

  });

});

