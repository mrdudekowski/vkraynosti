import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultSiteSeoDocument } from '../../cms/siteSeoDocument';
import SiteSeoSection from './SiteSeoSection';

describe('SiteSeoSection', () => {
  it('edits SEO fields on a fixed site page', () => {
    const onChange = vi.fn();
    const value = createDefaultSiteSeoDocument();
    render(<SiteSeoSection value={value} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Title', { selector: '#site-seo-title-home' }), { target: { value: 'Туры по Приморью' } });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, pages: value.pages.map((page) => page.key === 'home' ? { ...page, title: 'Туры по Приморью' } : page) });
    fireEvent.change(screen.getByLabelText('Meta description', { selector: '#site-seo-description-home' }), { target: { value: 'Маршруты из Владивостока.' } });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, pages: value.pages.map((page) => page.key === 'home' ? { ...page, description: 'Маршруты из Владивостока.' } : page) });
    fireEvent.change(screen.getByLabelText('Ключевые фразы для Яндекса', { selector: '#site-seo-keywords-home' }), { target: { value: 'туры по Приморью\nэкскурсии из Владивостока' } });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, pages: value.pages.map((page) => page.key === 'home' ? { ...page, keywords: ['туры по Приморью', 'экскурсии из Владивостока'] } : page) });
  });
});
