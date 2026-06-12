import { describe, it, expect } from 'vitest';
import { tourRequestFormSchema } from './tourRequestSchema';

describe('tourRequestFormSchema', () => {
  it('rejects empty required fields', () => {
    const r = tourRequestFormSchema.safeParse({
      name: '',
      preferredMessenger: '',
      email: '',
      phone: '',
      partySize: '',
      withChildren: false,
      question: '',
      privacyAccepted: false,
    });
    expect(r.success).toBe(false);
  });

  it('accepts valid payload without email', () => {
    const r = tourRequestFormSchema.safeParse({
      name: 'Иван',
      preferredMessenger: 'telegram',
      email: '',
      phone: '+7 900 000-00-00',
      partySize: '3',
      withChildren: true,
      question: 'Когда старт?',
      privacyAccepted: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.partySize).toBe(3);
      expect(r.data.withChildren).toBe(true);
    }
  });

  it('rejects invalid email when provided', () => {
    const r = tourRequestFormSchema.safeParse({
      name: 'Иван',
      preferredMessenger: 'whatsapp',
      email: 'not-an-email',
      phone: '+1',
      partySize: '2',
      withChildren: false,
      question: 'Вопрос',
      privacyAccepted: true,
    });
    expect(r.success).toBe(false);
  });
});
