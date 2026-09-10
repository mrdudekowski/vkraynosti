import { describe, expect, it } from 'vitest';
import {
  addCrmFolder,
  createEmptyCrmFile,
  isPersonComplete,
  isPotentialDeal,
  listContactPeople,
  listDealRows,
  searchDealRows,
  type CrmDeal,
  type CrmPerson,
} from './crmDocument';

const person = (patch: Partial<CrmPerson> = {}): CrmPerson => ({
  id: 'p1',
  name: 'Анна',
  phone: '+79001112233',
  messenger: 'telegram',
  messengerHandle: '@anna',
  note: '',
  folder: null,
  createdAt: '2026-08-16T00:00:00.000Z',
  updatedAt: '2026-08-16T00:00:00.000Z',
  ...patch,
});

const deal = (patch: Partial<CrmDeal> = {}): CrmDeal => ({
  id: 'd1',
  personId: 'p1',
  tourId: 'summer-1',
  tourTitle: 'Краббе',
  date: '2026-08-20',
  status: 'new',
  paid: false,
  doubts: false,
  pauseReason: '',
  comment: 'подумает',
  nextStep: '',
  nextStepAt: null,
  source: 'admin',
  ownerLogin: 'alice',
  touches: [],
  createdAt: '2026-08-16T00:00:00.000Z',
  updatedAt: '2026-08-16T01:00:00.000Z',
  ...patch,
});

describe('crm views', () => {
  it('считает карточку полной при имени, телефоне и способе связи', () => {
    expect(isPersonComplete(person())).toBe(true);
    expect(isPersonComplete(person({ phone: '  ' }))).toBe(false);
  });

  it('кладёт в потенциальные незакрытый, сомневающийся или отказной лид', () => {
    expect(isPotentialDeal(person(), deal({ paid: false }))).toBe(true);
    expect(isPotentialDeal(person(), deal({ paid: true, doubts: true }))).toBe(true);
    expect(isPotentialDeal(person(), deal({ paid: true, status: 'declined' }))).toBe(true);
    expect(isPotentialDeal(person(), deal({ paid: true, status: 'booked' }))).toBe(false);
  });

  it('в лидах показывает сделку с туром, в контактах — только папки', () => {
    const file = {
      ...createEmptyCrmFile(),
      people: [person(), person({ id: 'p2', name: 'База', folder: 'tour_bases' })],
      deals: [deal()],
    };
    expect(listDealRows(file, 'leads')).toHaveLength(1);
    expect(listDealRows(file, 'leads')[0]?.deal.tourTitle).toBe('Краббе');
    expect(listContactPeople(file).map((item) => item.id)).toEqual(['p2']);
  });

  it('ищет по имени и туру', () => {
    const rows = [{ person: person(), deal: deal() }];
    expect(searchDealRows(rows, 'краб')).toHaveLength(1);
    expect(searchDealRows(rows, 'зима')).toHaveLength(0);
  });

  it('не дублирует встроенную папку', () => {
    const next = addCrmFolder(createEmptyCrmFile(), 'suppliers');
    expect(next.folders).toEqual([]);
    expect(addCrmFolder(next, 'Снаряжение').folders).toEqual(['Снаряжение']);
  });
});
