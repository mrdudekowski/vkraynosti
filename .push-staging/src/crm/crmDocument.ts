import { z } from 'zod';

export const CRM_SCHEMA_VERSION = 1 as const;

export const CRM_MESSENGERS = ['telegram', 'whatsapp', 'max', 'phone'] as const;
export const CRM_DEAL_STATUSES = ['new', 'in_progress', 'booked', 'declined', 'no_answer'] as const;
export const CRM_CONTACT_FOLDERS = ['suppliers', 'tour_bases', 'captains', 'drivers', 'other'] as const;
export const CRM_TOUCH_KINDS = ['called', 'wrote'] as const;
export const CRM_INBOUND_SOURCES = ['site', 'bot', 'admin'] as const;
export const CRM_LIST_VIEWS = ['leads', 'potential', 'contacts'] as const;

export type CrmMessenger = (typeof CRM_MESSENGERS)[number];
export type CrmDealStatus = (typeof CRM_DEAL_STATUSES)[number];
export type CrmContactFolder = (typeof CRM_CONTACT_FOLDERS)[number];
export type CrmTouchKind = (typeof CRM_TOUCH_KINDS)[number];
export type CrmInboundSource = (typeof CRM_INBOUND_SOURCES)[number];
export type CrmListView = (typeof CRM_LIST_VIEWS)[number];

export const crmTouchSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(CRM_TOUCH_KINDS),
  at: z.string().min(1),
  note: z.string().default(''),
});

export const crmPersonSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  messenger: z.enum(CRM_MESSENGERS),
  messengerHandle: z.string().default(''),
  note: z.string().default(''),
  folder: z.string().min(1).nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const crmDealSchema = z.object({
  id: z.string().min(1),
  personId: z.string().min(1),
  tourId: z.string().min(1),
  tourTitle: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(CRM_DEAL_STATUSES),
  paid: z.boolean(),
  doubts: z.boolean(),
  pauseReason: z.string().default(''),
  comment: z.string().default(''),
  nextStep: z.string().default(''),
  nextStepAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  source: z.enum(CRM_INBOUND_SOURCES),
  ownerLogin: z.string().min(1),
  touches: z.array(crmTouchSchema),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const crmFileSchema = z.object({
  schemaVersion: z.literal(CRM_SCHEMA_VERSION),
  rev: z.number().int().positive(),
  people: z.array(crmPersonSchema),
  deals: z.array(crmDealSchema),
  folders: z.array(z.string().min(1)),
});

export type CrmTouch = z.infer<typeof crmTouchSchema>;
export type CrmPerson = z.infer<typeof crmPersonSchema>;
export type CrmDeal = z.infer<typeof crmDealSchema>;
export type CrmFile = z.infer<typeof crmFileSchema>;

export function createEmptyCrmFile(): CrmFile {
  return {
    schemaVersion: CRM_SCHEMA_VERSION,
    rev: 1,
    people: [],
    deals: [],
    folders: [],
  };
}

export function parseCrmFile(input: unknown): CrmFile {
  return crmFileSchema.parse(input);
}

export function isBuiltInContactFolder(folder: string): folder is CrmContactFolder {
  return (CRM_CONTACT_FOLDERS as readonly string[]).includes(folder);
}

export function isPersonComplete(person: Pick<CrmPerson, 'name' | 'phone' | 'messenger'>): boolean {
  return person.name.trim().length > 0 && person.phone.trim().length > 0 && person.messenger.length > 0;
}

export function isPotentialDeal(
  person: Pick<CrmPerson, 'name' | 'phone' | 'messenger'>,
  deal: Pick<CrmDeal, 'paid' | 'doubts' | 'status'>,
): boolean {
  return !isPersonComplete(person) || !deal.paid || deal.doubts || deal.status === 'declined';
}

export type CrmDealRow = {
  person: CrmPerson;
  deal: CrmDeal;
};

export function listDealRows(file: CrmFile, view: 'leads' | 'potential'): CrmDealRow[] {
  const people = new Map(file.people.map((person) => [person.id, person]));
  const rows: CrmDealRow[] = [];
  for (const deal of file.deals) {
    const person = people.get(deal.personId);
    if (person == null) {
      continue;
    }
    if (view === 'potential' && !isPotentialDeal(person, deal)) {
      continue;
    }
    rows.push({ person, deal });
  }
  return rows.sort((left, right) => right.deal.updatedAt.localeCompare(left.deal.updatedAt));
}

export function listContactPeople(file: CrmFile): CrmPerson[] {
  return file.people
    .filter((person) => person.folder != null)
    .sort((left, right) => left.name.localeCompare(right.name, 'ru'));
}

export function dealsForPerson(file: CrmFile, personId: string): CrmDeal[] {
  return file.deals
    .filter((deal) => deal.personId === personId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function searchDealRows(rows: CrmDealRow[], query: string): CrmDealRow[] {
  const needle = query.trim().toLocaleLowerCase('ru-RU');
  if (needle.length === 0) {
    return rows;
  }
  return rows.filter((row) => {
    const hay = `${row.person.name} ${row.person.phone} ${row.deal.tourTitle} ${row.deal.comment}`;
    return hay.toLocaleLowerCase('ru-RU').includes(needle);
  });
}

export function searchPeople(people: CrmPerson[], query: string): CrmPerson[] {
  const needle = query.trim().toLocaleLowerCase('ru-RU');
  if (needle.length === 0) {
    return people;
  }
  return people.filter((person) => {
    const hay = `${person.name} ${person.phone} ${person.folder ?? ''} ${person.note}`;
    return hay.toLocaleLowerCase('ru-RU').includes(needle);
  });
}

export function bumpCrmRev(file: CrmFile): CrmFile {
  return { ...file, rev: file.rev + 1 };
}

export function upsertPerson(file: CrmFile, person: CrmPerson): CrmFile {
  const exists = file.people.some((item) => item.id === person.id);
  return {
    ...file,
    people: exists
      ? file.people.map((item) => (item.id === person.id ? person : item))
      : [...file.people, person],
  };
}

export function upsertDeal(file: CrmFile, deal: CrmDeal): CrmFile {
  const exists = file.deals.some((item) => item.id === deal.id);
  return {
    ...file,
    deals: exists
      ? file.deals.map((item) => (item.id === deal.id ? deal : item))
      : [...file.deals, deal],
  };
}

export function addCrmFolder(file: CrmFile, folder: string): CrmFile {
  const name = folder.trim();
  if (name.length === 0 || isBuiltInContactFolder(name) || file.folders.includes(name)) {
    return file;
  }
  return { ...file, folders: [...file.folders, name] };
}
