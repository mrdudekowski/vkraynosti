import type { SiteContentDocument, SiteContentDocumentKind } from './siteContentDocument';

export type SiteContentChange = { label: string; from: string; to: string };
export type SiteContentChangesItem = {
  kind: SiteContentDocumentKind;
  title: string;
  author: string;
  timestamp: string;
  rev: number;
  changes: SiteContentChange[];
};

export const SITE_CONTENT_KIND_LABELS: Record<SiteContentDocumentKind, string> = {
  team: 'Команда', contacts: 'Контакты', footer: 'Подвал', modal: 'Модальная заявка',
};

const display = (value: unknown): string => {
  if (value == null || value === '') return 'не задано';
  if (typeof value === 'boolean') return value ? 'включено' : 'выключено';
  return String(value);
};

export function siteContentChanges(
  kind: SiteContentDocumentKind,
  draft: SiteContentDocument,
  published: SiteContentDocument | null,
): SiteContentChange[] {
  if (published != null && JSON.stringify(draft) === JSON.stringify(published)) return [];
  if (kind === 'modal' && draft.kind === 'modal') {
    const previous = published?.kind === 'modal' ? published : null;
    return [
      ['Режим CTA', previous?.requestFormEnabled == null ? 'не опубликован' : (previous.requestFormEnabled ? 'форма заявки' : 'контакты'), draft.requestFormEnabled ? 'форма заявки' : 'контакты'],
      ['Заголовок контактного окна', previous?.contactTitle, draft.contactTitle],
      ['Описание контактного окна', previous?.contactDescription, draft.contactDescription],
      ['Текст CTA со страницы тура', previous?.tourContactTitle, draft.tourContactTitle],
    ].filter(([, from, to]) => display(from) !== display(to)).map(([label, from, to]) => ({ label: String(label), from: display(from), to: display(to) }));
  }
  if (kind === 'contacts' && draft.kind === 'contacts') {
    const previous = published?.kind === 'contacts' ? published : null;
    const changes: SiteContentChange[] = [];
    if (previous?.sectionVisible !== draft.sectionVisible) changes.push({ label: 'Секция контактов', from: display(previous?.sectionVisible), to: display(draft.sectionVisible) });
    const oldChannels = new Map(previous?.channels.map((channel) => [channel.id, channel]) ?? []);
    for (const channel of draft.channels) {
      const old = oldChannels.get(channel.id);
      if (old == null) changes.push({ label: `Канал: ${channel.label}`, from: 'не задан', to: channel.visible ? 'добавлен и видим' : 'добавлен, скрыт' });
      else if (old.label !== channel.label || old.href !== channel.href || old.visible !== channel.visible || old.order !== channel.order) changes.push({ label: `Канал: ${channel.label}`, from: old.visible ? 'изменён' : 'скрыт', to: channel.visible ? 'видим' : 'скрыт' });
    }
    for (const channel of previous?.channels ?? []) if (!draft.channels.some((item) => item.id === channel.id)) changes.push({ label: `Канал: ${channel.label}`, from: 'опубликован', to: 'удалён' });
    return changes;
  }
  return [{ label: `Раздел «${SITE_CONTENT_KIND_LABELS[kind]}»`, from: 'опубликованная версия', to: 'есть изменения в черновике' }];
}
