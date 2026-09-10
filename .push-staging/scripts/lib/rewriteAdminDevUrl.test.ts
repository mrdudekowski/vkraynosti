import { describe, expect, it } from 'vitest';
import { rewriteAdminDevUrl } from './rewriteAdminDevUrl';

const base = '/vkraynosti/';

describe('rewriteAdminDevUrl', () => {
  it('отправляет /vkraynosti/admin на MPA html', () => {
    expect(rewriteAdminDevUrl('/vkraynosti/admin', base)).toBe('/admin/index.html');
    expect(rewriteAdminDevUrl('/vkraynosti/admin/', base)).toBe('/admin/index.html');
    expect(rewriteAdminDevUrl('/vkraynosti/admin/index.html', base)).toBe('/admin/index.html');
    expect(rewriteAdminDevUrl('/vkraynosti/admin/?tour=winter-1', base)).toBe(
      '/admin/index.html?tour=winter-1'
    );
  });

  it('не трогает витрину и файлы', () => {
    expect(rewriteAdminDevUrl('/vkraynosti/', base)).toBe('/vkraynosti/');
    expect(rewriteAdminDevUrl('/vkraynosti/tours/winter-1', base)).toBe(
      '/vkraynosti/tours/winter-1'
    );
    expect(rewriteAdminDevUrl('/admin/', base)).toBe('/admin/');
    expect(rewriteAdminDevUrl('/vkraynosti/admin/foo.js', base)).toBe('/vkraynosti/admin/foo.js');
  });

  it('ловит /vkraynosti/admin даже если Vite base = /', () => {
    expect(rewriteAdminDevUrl('/vkraynosti/admin/', '/')).toBe('/admin/index.html');
    expect(rewriteAdminDevUrl('/vkraynosti/admin', '/')).toBe('/admin/index.html');
  });
});
