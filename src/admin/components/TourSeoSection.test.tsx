import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TourSeoSection from './TourSeoSection';

describe('TourSeoSection', () => {
  it('edits title, description, H1, and keyword phrases', () => {
    const onChange = vi.fn();
    const value = { title: '', description: '', h1: '', keywords: [] };
    render(<TourSeoSection title="Поездка на остров" imageUrl="/cover.jpg" value={value} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'SEO title' } });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, title: 'SEO title' });
    fireEvent.change(screen.getByLabelText('Meta description'), { target: { value: 'Маршрут из Владивостока.' } });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, description: 'Маршрут из Владивостока.' });
    fireEvent.change(screen.getByLabelText('H1 на странице'), { target: { value: 'SEO H1' } });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, h1: 'SEO H1' });
    fireEvent.change(screen.getByLabelText('Ключевые фразы для Яндекса'), { target: { value: 'островной тур\nпоездка из Владивостока' } });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, keywords: ['островной тур', 'поездка из Владивостока'] });
  });

  it('limits edited keyword phrases to eight', () => {
    const onChange = vi.fn();
    render(<TourSeoSection title="Тур" imageUrl="" value={{ title: '', description: '', h1: '', keywords: [] }} onChange={onChange} />);
    const phrases = Array.from({ length: 10 }, (_, index) => `фраза ${index + 1}`).join('\n');
    fireEvent.change(screen.getByLabelText('Ключевые фразы для Яндекса'), { target: { value: phrases } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ keywords: Array.from({ length: 8 }, (_, index) => `фраза ${index + 1}`) }));
  });
});
