import { describe, it, expect } from 'vitest';
import { tourRequestFormSchema } from './tourRequestSchema';

describe('tourRequestFormSchema', () => {
  it('rejects empty required fields', () => {
    const r = tourRequestFormSchema.safeParse({
      name: '',
      email: '',
      phone: '',
      question: '',
      privacyAccepted: false,
    });
    expect(r.success).toBe(false);
  });

  it('accepts valid payload without email', () => {
    const r = tourRequestFormSchema.safeParse({
      name: 'Иван',
      email: '',
      phone: '+7 900 000-00-00',
      question: 'Когда старт?',
      privacyAccepted: true,
    });
    expect(r.success).toBe(true);
  });

  it('rejects invalid email when provided', () => {
    const r = tourRequestFormSchema.safeParse({
      name: 'Иван',
      email: 'not-an-email',
      phone: '+1',
      question: 'Вопрос',
      privacyAccepted: true,
    });
    expect(r.success).toBe(false);
  });
});
