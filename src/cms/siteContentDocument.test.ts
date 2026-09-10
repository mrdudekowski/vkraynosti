import { describe, expect, it } from 'vitest';
import {
  parseSiteContentDocument,
  type ContactsContentDocument,
  type FooterContentDocument,
  type TeamContentDocument,
} from './siteContentDocument';

describe('site content documents', () => {
  it('parses a team document with independently visible fields', () => {
    const document = parseSiteContentDocument('team', {
      kind: 'team',
      schemaVersion: 1,
      members: [
        {
          id: 'member-1',
          name: 'Имя',
          photo: {
            assetId: 'photo-1',
            url: 'https://cdn.test/photo.webp',
            mimeType: 'image/webp',
            alt: 'Портрет',
          },
          role: 'Гид',
          roleVisible: false,
          experience: '10 лет',
          experienceVisible: true,
          bio: 'Описание\n\nВторой абзац',
          bioVisible: true,
          visible: true,
          order: 0,
        },
      ],
    }) as TeamContentDocument;

    expect(document.members[0]).toMatchObject({ roleVisible: false, experienceVisible: true });
  });

  it('defaults contact and footer visibility values', () => {
    const contacts = parseSiteContentDocument('contacts', {
      kind: 'contacts',
      schemaVersion: 1,
      sectionVisible: true,
      channels: [{ id: 'phone', label: 'Телефон', href: 'tel:+70000000000', type: 'phone' }],
    }) as ContactsContentDocument;
    const footer = parseSiteContentDocument('footer', {
      kind: 'footer',
      schemaVersion: 1,
      blocks: [{ id: 'brand', heading: 'Бренд', rows: [{ id: 'tagline', type: 'text', label: 'Описание', value: 'Текст' }] }],
    }) as FooterContentDocument;

    expect(contacts.channels[0]?.visible).toBe(true);
    expect(contacts.channels[0]?.order).toBe(0);
    expect(footer.blocks[0]?.visible).toBe(true);
    expect(footer.blocks[0]?.rows[0]?.visible).toBe(true);
  });

  it('rejects a team member without a name or photo', () => {
    expect(() =>
      parseSiteContentDocument('team', {
        kind: 'team',
        schemaVersion: 1,
        members: [{ id: 'broken', name: '', photo: null, visible: true, order: 0 }],
      }),
    ).toThrow();
  });
});
