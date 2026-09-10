import { describe, expect, it } from 'vitest';
import { seedSiteContentDocuments } from './siteContentSeed';

describe('site content seed', () => {
  it('imports current team, contacts, footer, legal, and navigation content', () => {
    const documents = seedSiteContentDocuments();

    expect(documents.team.members).toHaveLength(4);
    expect(documents.team.members.map(member => member.name)).toEqual(['Ярослав', 'Элина', 'Елена', 'Павел']);
    expect(documents.contacts.channels.map(channel => channel.id)).toEqual(['phone', 'email', 'telegram', 'max']);
    expect(documents.footer.blocks.flatMap(block => block.rows).some(row => row.id === 'offer-and-safety')).toBe(true);
    expect(documents.footer.blocks.flatMap(block => block.rows).some(row => row.id === 'nav-tours')).toBe(true);
  });
});
