import { describe, expect, it } from 'vitest';
import { createDefaultSiteSeoDocument, parseSiteSeoDocument, siteSeoDocumentSchema } from './siteSeoDocument';

describe('siteSeoDocumentSchema', () => {
  it('создаёт ровно пять фиксированных публичных страниц', () => {
    const document = createDefaultSiteSeoDocument();
    expect(document.pages.map((page) => page.key)).toEqual(['home', 'winter', 'spring', 'summer', 'fall']);
    expect(parseSiteSeoDocument(document)).toEqual(document);
  });

  it('отклоняет неизвестный или неправильный маршрут страницы', () => {
    const document = createDefaultSiteSeoDocument();
    expect(siteSeoDocumentSchema.safeParse({ ...document, pages: [...document.pages, { key: 'blog', path: '/blog', title: '', description: '', h1: '' }] }).success).toBe(false);
    expect(siteSeoDocumentSchema.safeParse({ ...document, pages: document.pages.map((page) => page.key === 'home' ? { ...page, path: '/home' } : page) }).success).toBe(false);
  });

  it('accepts a short curated keyword list and rejects large tag piles', () => {
    const document = createDefaultSiteSeoDocument();
    const withKeywords = { ...document, pages: document.pages.map((page) => page.key === 'home' ? { ...page, keywords: ['туры по Приморью', 'поездки из Владивостока'] } : page) };
    expect(parseSiteSeoDocument(withKeywords).pages[0]?.keywords).toHaveLength(2);
    const tooMany = { ...document, pages: document.pages.map((page) => page.key === 'home' ? { ...page, keywords: Array.from({ length: 9 }, (_, index) => `фраза ${index}`) } : page) };
    expect(siteSeoDocumentSchema.safeParse(tooMany).success).toBe(false);
  });
});
