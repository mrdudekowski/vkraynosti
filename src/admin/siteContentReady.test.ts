import { describe, expect, it } from 'vitest';
import { ADMIN_UI } from './constants/ui';
import { siteContentBlocker } from './siteContentReady';

describe('siteContentBlocker', () => {
  it('blocks a team member without a photo url', () => {
    expect(
      siteContentBlocker({
        kind: 'team',
        schemaVersion: 1,
        members: [
          {
            id: 'member-1',
            name: 'Анна',
            photo: { assetId: '', url: '', mimeType: 'image/webp', alt: '' },
            role: '',
            roleVisible: true,
            experience: '',
            experienceVisible: false,
            bio: '',
            bioVisible: true,
            visible: true,
            order: 0,
          },
        ],
      }),
    ).toBe(ADMIN_UI.sitePhotoRequired);
  });

  it('blocks a pdf footer row without a file', () => {
    expect(
      siteContentBlocker({
        kind: 'footer',
        schemaVersion: 1,
        blocks: [
          {
            id: 'block-1',
            heading: 'Документы',
            visible: true,
            order: 0,
            rows: [
              {
                id: 'row-1',
                type: 'pdf',
                label: 'Оферта',
                value: 'Оферта',
                documentId: 'pdf-1',
                visible: true,
                order: 0,
              },
            ],
          },
        ],
      }),
    ).toBe(ADMIN_UI.sitePdfRequired);
  });

  it('allows a complete contacts draft', () => {
    expect(
      siteContentBlocker({
        kind: 'contacts',
        schemaVersion: 1,
        sectionVisible: true,
        channels: [
          {
            id: 'phone',
            label: '+7',
            href: 'tel:+7',
            type: 'phone',
            visible: true,
            order: 0,
          },
        ],
      }),
    ).toBeNull();
  });
});
