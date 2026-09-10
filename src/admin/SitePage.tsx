import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, ContactRound, FileText, Link2, MessageCircle, PanelBottom, Phone, Save, Send, UploadCloud, UsersRound } from 'lucide-react';
import { adminGetSiteContent, adminPublishSiteContent, adminSaveSiteContent, adminUploadSiteAsset } from './api';
import AdminAlert from './components/AdminAlert';
import AdminButton from './components/AdminButton';
import { AdminFieldLabel, AdminTextArea, AdminTextInput } from './components/AdminFields';
import AdminPageFrame from './components/AdminPageFrame';
import AdminPageHeader from './components/AdminPageHeader';
import AdminStatus from './components/AdminStatus';
import { ADMIN_UI } from './constants/ui';
import type { ContactsContentDocument, FooterContentDocument, FooterContentRow, ModalContentDocument, SiteContentDocument, TeamContentDocument } from '../cms/siteContentDocument';
import './site-page.css';

type Kind = 'team' | 'contacts' | 'footer' | 'modal';
type LoadErrors = Partial<Record<Kind, string>>;
const tabs: Array<{ id: Kind; label: string; icon: typeof UsersRound }> = [
  { id: 'team', label: 'Команда', icon: UsersRound },
  { id: 'contacts', label: 'Контакты', icon: ContactRound },
  { id: 'footer', label: 'Подвал', icon: PanelBottom },
  { id: 'modal', label: 'Модалки', icon: MessageCircle },
];

const tabFromHash = (): Kind => {
  const query = location.hash.split('?')[1];
  const requested = new URLSearchParams(query).get('tab');
  return tabs.some((item) => item.id === requested) ? requested as Kind : 'team';
};

const siteErrorMessage = (reason: unknown) => {
  if (reason instanceof Error && reason.message === 'forbidden') return 'У вас нет прав для редактирования или публикации этого раздела.';
  if (reason instanceof Error && reason.message === 'rev_conflict') return 'Черновик изменился в другой вкладке. Перезагрузите данные перед сохранением.';
  if (reason instanceof Error && reason.message === 'site_content_load_failed') return 'Не удалось загрузить раздел «Сайт». Повторите попытку.';
  return 'Не удалось сохранить изменения. Повторите попытку.';
};

const move = <T extends { order: number }>(items: T[], index: number, delta: number) => {
  const next = [...items]; const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, order) => ({ ...item, order }));
};

const TeamTab = ({ value, onChange, onUpload }: { value: TeamContentDocument; onChange: (value: TeamContentDocument) => void; onUpload: (memberId: string, file: File) => Promise<void> }) => {
  const members = [...value.members].sort((a, b) => a.order - b.order);
  return (
  <section id="admin-panel-team" role="tabpanel" aria-labelledby="admin-tab-team" className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-semibold">Участники команды</h2><p className="mt-1 text-sm text-text-muted">Карточки, порядок и видимость людей на сайте.</p></div><AdminButton onClick={() => onChange({ ...value, members: [...value.members, { id: `member-${Date.now()}`, name: 'Новый участник', photo: { assetId: '', url: '', mimeType: 'image/*', alt: '' }, role: '', roleVisible: true, experience: '', experienceVisible: false, bio: '', bioVisible: true, visible: true, order: value.members.length }] })}>Добавить участника</AdminButton></div>
    <div className="grid gap-3 xl:grid-cols-2">
    {members.map((member, index) => <article key={member.id} className="admin-card flex min-w-0 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><strong className="min-w-0 truncate">{member.name || 'Без имени'}</strong><div className="flex gap-1"><AdminButton variant="ghost" aria-label={`Поднять ${member.name || 'участника'}`} disabled={index === 0} onClick={() => onChange({ ...value, members: move(members, index, -1) })}><ChevronUp size={18} aria-hidden="true" /></AdminButton><AdminButton variant="ghost" aria-label={`Опустить ${member.name || 'участника'}`} disabled={index === members.length - 1} onClick={() => onChange({ ...value, members: move(members, index, 1) })}><ChevronDown size={18} aria-hidden="true" /></AdminButton><AdminButton variant="destructive" onClick={() => onChange({ ...value, members: members.filter((item) => item.id !== member.id).map((item, order) => ({ ...item, order })) })}>Удалить</AdminButton></div></div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"><div className="min-w-0"><label><AdminFieldLabel htmlFor={`${member.id}-name`} required>Имя</AdminFieldLabel><AdminTextInput id={`${member.id}-name`} value={member.name} onChange={(event) => onChange({ ...value, members: value.members.map((item) => item.id === member.id ? { ...item, name: event.target.value } : item) })} /></label><label className="mt-3 block"><AdminFieldLabel htmlFor={`${member.id}-photo`} required>URL фотографии</AdminFieldLabel><AdminTextInput id={`${member.id}-photo`} value={member.photo.url} onChange={(event) => onChange({ ...value, members: value.members.map((item) => item.id === member.id ? { ...item, photo: { ...item.photo, url: event.target.value } } : item) })} /><input className="mt-2 block max-w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" aria-label={`Загрузить фото для ${member.name || 'участника'}`} onChange={(event) => { const file = event.target.files?.[0]; if (file) void onUpload(member.id, file); }} /></label></div><div className="grid min-w-0 gap-3 sm:grid-cols-2"><label><AdminFieldLabel htmlFor={`${member.id}-role`}>Должность</AdminFieldLabel><AdminTextInput id={`${member.id}-role`} value={member.role} onChange={(event) => onChange({ ...value, members: value.members.map((item) => item.id === member.id ? { ...item, role: event.target.value } : item) })} /></label><label><AdminFieldLabel htmlFor={`${member.id}-experience`}>Опыт</AdminFieldLabel><AdminTextInput id={`${member.id}-experience`} value={member.experience} onChange={(event) => onChange({ ...value, members: value.members.map((item) => item.id === member.id ? { ...item, experience: event.target.value } : item) })} /></label><label className="sm:col-span-2"><AdminFieldLabel htmlFor={`${member.id}-bio`}>Описание</AdminFieldLabel><AdminTextArea id={`${member.id}-bio`} rows={3} value={member.bio} onChange={(event) => onChange({ ...value, members: value.members.map((item) => item.id === member.id ? { ...item, bio: event.target.value } : item) })} /></label></div></div>
      <div className="grid gap-x-4 gap-y-2 border-t border-border-subtle pt-3 text-sm sm:grid-cols-2"><label><input type="checkbox" checked={member.visible} onChange={(event) => onChange({ ...value, members: value.members.map((item) => item.id === member.id ? { ...item, visible: event.target.checked } : item) })} /> Показывать участника</label><label><input type="checkbox" checked={member.roleVisible} onChange={(event) => onChange({ ...value, members: value.members.map((item) => item.id === member.id ? { ...item, roleVisible: event.target.checked } : item) })} /> Показывать должность</label><label><input type="checkbox" checked={member.experienceVisible} onChange={(event) => onChange({ ...value, members: value.members.map((item) => item.id === member.id ? { ...item, experienceVisible: event.target.checked } : item) })} /> Показывать опыт</label><label><input type="checkbox" checked={member.bioVisible} onChange={(event) => onChange({ ...value, members: value.members.map((item) => item.id === member.id ? { ...item, bioVisible: event.target.checked } : item) })} /> Показывать описание</label></div>
    </article>)}
    </div>
  </section>
  );
};

const ContactsTab = ({ value, onChange }: { value: ContactsContentDocument; onChange: (value: ContactsContentDocument) => void }) => { const channels = [...value.channels].sort((a, b) => a.order - b.order); return <section id="admin-panel-contacts" role="tabpanel" aria-labelledby="admin-tab-contacts" className="flex max-w-5xl flex-col gap-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-semibold">Контакты</h2><p className="mt-1 text-sm text-text-muted">Ссылки и номера, которые видит посетитель.</p></div><label className="text-sm"><input type="checkbox" checked={value.sectionVisible} onChange={(event) => onChange({ ...value, sectionVisible: event.target.checked })} /> Показывать секцию контактов</label></div><div className="flex max-w-4xl flex-col gap-3">{channels.map((channel, index) => { const ChannelIcon = channelIcon(channel.type); return <article key={channel.id} className="admin-card grid min-w-0 gap-3 p-3 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.5fr)_auto]"><div className="flex items-center justify-center text-text-muted" aria-hidden="true"><ChannelIcon size={18} /></div><label><AdminFieldLabel htmlFor={`${channel.id}-label`}>Название</AdminFieldLabel><AdminTextInput id={`${channel.id}-label`} value={channel.label} onChange={(event) => onChange({ ...value, channels: value.channels.map((item) => item.id === channel.id ? { ...item, label: event.target.value } : item) })} /></label><label><AdminFieldLabel htmlFor={`${channel.id}-href`}>Ссылка или номер</AdminFieldLabel><AdminTextInput id={`${channel.id}-href`} value={channel.href} onChange={(event) => onChange({ ...value, channels: value.channels.map((item) => item.id === channel.id ? { ...item, href: event.target.value } : item) })} /></label><div className="flex flex-wrap items-end gap-1"><AdminButton variant="ghost" aria-label={`Поднять ${channel.label}`} disabled={index === 0} onClick={() => onChange({ ...value, channels: move(channels, index, -1) })}><ChevronUp size={18} aria-hidden="true" /></AdminButton><AdminButton variant="ghost" aria-label={`Опустить ${channel.label}`} disabled={index === channels.length - 1} onClick={() => onChange({ ...value, channels: move(channels, index, 1) })}><ChevronDown size={18} aria-hidden="true" /></AdminButton><label className="flex min-h-11 items-center gap-1 text-sm"><input aria-label={`Показывать ${channel.label}`} type="checkbox" checked={channel.visible} onChange={(event) => onChange({ ...value, channels: value.channels.map((item) => item.id === channel.id ? { ...item, visible: event.target.checked } : item) })} /> Показывать</label></div></article>; })}</div><AdminButton variant="secondary" className="w-fit" onClick={() => onChange({ ...value, channels: [...value.channels, { id: `channel-${Date.now()}`, label: 'Новая ссылка', href: '#', type: 'link', visible: true, order: value.channels.length }] })}>Добавить ссылку</AdminButton></section>; };

const FooterTab = ({ value, onChange }: { value: FooterContentDocument; onChange: (value: FooterContentDocument) => void }) => <section id="admin-panel-footer" role="tabpanel" aria-labelledby="admin-tab-footer" className="flex max-w-5xl flex-col gap-4"><div><h2 className="text-lg font-semibold">Подвал</h2><p className="mt-1 text-sm text-text-muted">Ссылки и информационные блоки внизу сайта.</p></div>{[...value.blocks].sort((a, b) => a.order - b.order).map((block) => <article key={block.id} className="admin-card flex max-w-4xl flex-col gap-3 p-3"><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><label><AdminFieldLabel htmlFor={`${block.id}-heading`}>Заголовок блока</AdminFieldLabel><AdminTextInput id={`${block.id}-heading`} value={block.heading} onChange={(event) => onChange({ ...value, blocks: value.blocks.map((item) => item.id === block.id ? { ...item, heading: event.target.value } : item) })} /></label><label className="pb-2 text-sm"><input type="checkbox" checked={block.visible} onChange={(event) => onChange({ ...value, blocks: value.blocks.map((item) => item.id === block.id ? { ...item, visible: event.target.checked } : item) })} /> Показывать блок</label></div>{[...block.rows].sort((a, b) => a.order - b.order).map((row) => <div key={row.id} className="grid gap-2 border-t border-border-subtle pt-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]"><label><AdminFieldLabel htmlFor={`${row.id}-label`}>Строка</AdminFieldLabel><AdminTextInput id={`${row.id}-label`} value={row.label} onChange={(event) => onChange({ ...value, blocks: value.blocks.map((item) => item.id === block.id ? { ...item, rows: item.rows.map((candidate) => candidate.id === row.id ? { ...candidate, label: event.target.value } as FooterContentRow : candidate) } : item) })} /></label><label><AdminFieldLabel htmlFor={`${row.id}-value`}>Значение</AdminFieldLabel><AdminTextInput id={`${row.id}-value`} value={row.value} onChange={(event) => onChange({ ...value, blocks: value.blocks.map((item) => item.id === block.id ? { ...item, rows: item.rows.map((candidate) => candidate.id === row.id ? { ...candidate, value: event.target.value } as FooterContentRow : candidate) } : item) })} /></label><label className="flex items-center gap-1 pb-2 text-sm"><input type="checkbox" checked={row.visible} onChange={(event) => onChange({ ...value, blocks: value.blocks.map((item) => item.id === block.id ? { ...item, rows: item.rows.map((candidate) => candidate.id === row.id ? { ...candidate, visible: event.target.checked } as FooterContentRow : candidate) } : item) })} /> Видим</label></div>)}</article>)}</section>;

const channelIcon = (type: string) => {
  if (type === 'phone') return Phone;
  if (type === 'telegram') return Send;
  if (type === 'whatsapp') return MessageCircle;
  return Link2;
};

const ModalModeSelector = ({ mode, onChange }: { mode: 'request' | 'contacts'; onChange: (mode: 'request' | 'contacts') => void }) => {
  const options = [{ id: 'request' as const, label: 'Заявка', icon: FileText }, { id: 'contacts' as const, label: 'Контакты', icon: ContactRound }];
  return <fieldset className="flex flex-col items-center">
    <legend className="sr-only">Режим CTA</legend>
    <div role="radiogroup" aria-label="Режим CTA" className="admin-modal-mode-switch">
      {options.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="radio" aria-checked={mode === id} className="admin-modal-mode-option" data-selected={mode === id} onClick={() => onChange(id)}><Icon size={17} aria-hidden="true" /><span>{label}</span>{mode === id ? <CheckCircle2 size={15} aria-hidden="true" /> : null}</button>)}
    </div>
    <p className="mt-2 text-center text-sm text-text-muted">Активный режим: {mode === 'contacts' ? 'Контакты' : 'Заявка'}</p>
  </fieldset>;
};

const RequestModalPreview = () => <div aria-label="Предпросмотр формы заявки" className="rounded-admin-surface border border-divider bg-surface-light p-4">
  <div className="flex items-start gap-2"><FileText size={18} className="mt-0.5 text-text-muted" aria-hidden="true" /><div><h3 className="font-semibold">Форма заявки</h3><p className="mt-1 text-sm text-text-muted">Системная форма. В этом разделе её поля не редактируются.</p></div></div>
  <div className="mt-4 grid gap-3" aria-label="Поля формы заявки"><div><span className="text-sm text-text-muted">Имя</span><div className="admin-modal-preview-field">Иван Иванов</div></div><div><span className="text-sm text-text-muted">Телефон</span><div className="admin-modal-preview-field">+7 900 000-00-00</div></div><div><span className="text-sm text-text-muted">Комментарий</span><div className="admin-modal-preview-field admin-modal-preview-field--multiline">Ваш вопрос</div></div></div>
  <button type="button" disabled className="admin-btn-primary mt-4 w-full justify-center">Отправить заявку</button>
</div>;

const ModalTab = ({ value, onChange, contacts, contactsError }: { value: ModalContentDocument; onChange: (value: ModalContentDocument) => void; contacts?: ContactsContentDocument; contactsError?: string }) => {
  const mode = value.requestFormEnabled ? 'request' : 'contacts';
  const visibleChannels = contacts?.channels.filter((channel) => channel.visible).sort((a, b) => a.order - b.order);
  return <section id="admin-panel-modal" role="tabpanel" aria-labelledby="admin-tab-modal" className="flex max-w-5xl flex-col gap-5">
    <div><h2 className="text-lg font-semibold">Модалки</h2><p className="mt-1 text-sm text-text-muted">Выберите, что открывается после нажатия CTA на сайте. Изменение применяется ко всем CTA.</p></div>
    <ModalModeSelector mode={mode} onChange={(nextMode) => onChange({ ...value, requestFormEnabled: nextMode === 'request' })} />
    {mode === 'contacts' ? <div className="grid min-w-0 gap-4 rounded-admin-surface border border-divider bg-surface-light p-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.75fr)]">
      <div className="grid min-w-0 gap-4"><div className="flex items-start gap-2"><ContactRound size={18} className="mt-0.5 text-text-muted" aria-hidden="true" /><div><h3 className="font-semibold">Содержимое модалки «Контакты»</h3><p className="mt-1 text-sm text-text-muted">Эти поля меняют текст контактного окна.</p></div></div><div className="grid gap-4 sm:grid-cols-2"><label><AdminFieldLabel htmlFor="modal-contact-title">Заголовок контактного окна</AdminFieldLabel><AdminTextInput id="modal-contact-title" value={value.contactTitle} onChange={(event) => onChange({ ...value, contactTitle: event.target.value })} /></label><label><AdminFieldLabel htmlFor="modal-tour-contact-title">Текст CTA со страницы тура</AdminFieldLabel><AdminTextInput id="modal-tour-contact-title" value={value.tourContactTitle} onChange={(event) => onChange({ ...value, tourContactTitle: event.target.value })} /></label><label className="sm:col-span-2"><AdminFieldLabel htmlFor="modal-contact-description">Описание контактного окна</AdminFieldLabel><AdminTextArea id="modal-contact-description" rows={3} value={value.contactDescription} onChange={(event) => onChange({ ...value, contactDescription: event.target.value })} /></label></div><div className="rounded-admin-control border border-divider bg-surface-dark/[0.03] p-3"><p className="text-sm font-medium">Пример CTA на странице тура</p><p className="mt-1 text-sm text-text-muted">{value.tourContactTitle} «Алтай: 7 дней»</p></div></div>
      <aside className="min-w-0 border-t border-divider pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0"><div className="flex items-start gap-2"><Phone size={18} className="mt-0.5 text-text-muted" aria-hidden="true" /><div><h3 className="font-semibold">Каналы в модалке</h3><p className="mt-1 text-sm text-text-muted">Используются все видимые каналы из «Контакты».</p></div></div><div className="mt-3 grid gap-2">{contactsError ? <p className="text-sm text-text-muted">Каналы контактов недоступны. Повторите загрузку раздела «Контакты».</p> : visibleChannels?.length ? visibleChannels.map((channel) => { const Icon = channelIcon(channel.type); return <div key={channel.id} className="flex min-h-11 min-w-0 items-center gap-2 rounded-admin-control border border-divider px-3 text-sm text-text-primary"><Icon size={16} className="shrink-0 text-text-muted" aria-hidden="true" /><span className="break-words">{channel.label}</span></div>; }) : <p className="text-sm text-text-muted">Нет видимых каналов. Проверьте раздел «Контакты».</p>}</div></aside>
    </div> : <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.75fr)]"><RequestModalPreview /><aside className="min-w-0 border-t border-divider pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0"><div className="flex items-start gap-2"><MessageCircle size={18} className="mt-0.5 text-text-muted" aria-hidden="true" /><div><h3 className="font-semibold">Что увидит посетитель</h3><p className="mt-1 text-sm text-text-muted">Форма заявки с отправкой данных в CRM/Telegram. Для страницы тура сохраняется контекст выбранного тура.</p></div></div></aside></div>}
  </section>;
};

const SitePage = () => {
  const tabRefs = useRef<Partial<Record<Kind, HTMLButtonElement>>>({});
  const [tab, setTab] = useState<Kind>(tabFromHash);
  const [documents, setDocuments] = useState<Partial<Record<Kind, SiteContentDocument>>>({});
  const [revisions, setRevisions] = useState<Partial<Record<Kind, number>>>({});
  const [status, setStatus] = useState<Partial<Record<Kind, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadErrors, setLoadErrors] = useState<LoadErrors>({});
  useEffect(() => {
    let alive = true;
    const kinds: Kind[] = tab === 'modal' ? ['modal', 'contacts'] : [tab];
    void Promise.all(kinds.map(async (kind) => { try { return { kind, result: await adminGetSiteContent(kind) }; } catch (reason: unknown) { return { kind, error: reason instanceof Error ? reason.message : 'site_content_load_failed' }; } })).then((items) => {
      if (!alive) return;
      const fulfilled = items.filter((item): item is { kind: Kind; result: Awaited<ReturnType<typeof adminGetSiteContent>> } => 'result' in item);
      setDocuments((current) => ({ ...current, ...Object.fromEntries(fulfilled.map(({ kind, result }) => [kind, result.document])) }));
      setRevisions((current) => ({ ...current, ...Object.fromEntries(fulfilled.map(({ kind, result }) => [kind, result.meta.rev])) }));
      setStatus((current) => ({ ...current, ...Object.fromEntries(fulfilled.map(({ kind }) => [kind, 'saved'])) }));
      setLoadErrors((current) => ({ ...current, ...Object.fromEntries(items.map(({ kind, error }) => [kind, error]).filter(([, itemError]) => itemError != null)) }));
      const primaryError = items.find((item) => item.kind === tab && 'error' in item)?.error;
      setError(primaryError ? siteErrorMessage(new Error(primaryError)) : null);
      if (primaryError) setStatus((current) => ({ ...current, [tab]: 'error' }));
    });
    return () => { alive = false; };
  }, [tab]);
  const document = documents[tab];
  const setDocument = (next: SiteContentDocument) => { setDocuments((current) => ({ ...current, [tab]: next })); setStatus((current) => ({ ...current, [tab]: 'dirty' })); };
  const uploadTeamPhoto = async (memberId: string, file: File) => { try { const result = await adminUploadSiteAsset('team', file); const team = documents.team; if (team?.kind === 'team') setDocument({ ...team, members: team.members.map((member) => member.id === memberId ? { ...member, photo: result.asset } : member) }); } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : 'site_asset_upload_failed'); } };
  const save = async (publish = false) => { if (document == null || revisions[tab] == null) return; setStatus((current) => ({ ...current, [tab]: 'saving' })); try { const result = publish ? await adminPublishSiteContent(tab, revisions[tab]) : await adminSaveSiteContent(tab, revisions[tab], document); setDocuments((current) => ({ ...current, [tab]: result.document })); setRevisions((current) => ({ ...current, [tab]: result.meta.rev })); setStatus((current) => ({ ...current, [tab]: publish ? 'published' : 'saved' })); setError(null); } catch (reason: unknown) { setError(siteErrorMessage(reason)); setStatus((current) => ({ ...current, [tab]: 'error' })); } };
  const content = document == null ? <p className="text-text-muted">{ADMIN_UI.loading}</p> : tab === 'team' ? <TeamTab value={document as TeamContentDocument} onChange={setDocument} onUpload={uploadTeamPhoto} /> : tab === 'contacts' ? <ContactsTab value={document as ContactsContentDocument} onChange={setDocument} /> : tab === 'footer' ? <FooterTab value={document as FooterContentDocument} onChange={setDocument} /> : <ModalTab value={document as ModalContentDocument} onChange={setDocument} contacts={documents.contacts?.kind === 'contacts' ? documents.contacts : undefined} contactsError={loadErrors.contacts} />;
  const selectTab = (next: Kind, focus = false) => { setTab(next); setError(null); const nextHash = `#/site?tab=${next}`; if (location.hash !== nextHash) history.replaceState(null, '', nextHash); if (focus) requestAnimationFrame(() => tabRefs.current[next]?.focus()); };
  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => { const index = tabs.findIndex((item) => item.id === tab); const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null; if (delta == null) return; event.preventDefault(); const next = tabs[(delta === 0 || delta === tabs.length - 1) ? delta : (index + delta + tabs.length) % tabs.length].id; selectTab(next, true); };
  const isSaving = status[tab] === 'saving';
  return <AdminPageFrame variant="wide"><AdminPageHeader title={ADMIN_UI.siteNav} description={ADMIN_UI.siteDescription} action={<div className="flex gap-2"><AdminButton variant="secondary" aria-busy={isSaving} disabled={document == null || isSaving} onClick={() => void save()}><Save size={16} aria-hidden="true" />{isSaving ? ADMIN_UI.saving : 'Сохранить черновик'}</AdminButton><AdminButton aria-busy={isSaving} disabled={document == null || isSaving || status[tab] === 'dirty'} onClick={() => void save(true)}><UploadCloud size={16} aria-hidden="true" />{isSaving ? 'Публикуем…' : 'Опубликовать на сайте'}</AdminButton></div>} /><div role="tablist" aria-label="Разделы сайта" onKeyDown={onTabKeyDown} className="grid max-w-3xl grid-cols-2 gap-1 rounded-admin-control border border-divider bg-surface-light p-1 sm:grid-cols-4"><div className="contents">{tabs.map(({ id, label, icon: Icon }) => <button key={id} ref={(element) => { if (element) tabRefs.current[id] = element; }} type="button" id={`admin-tab-${id}`} role="tab" aria-selected={tab === id} aria-controls={`admin-panel-${id}`} tabIndex={tab === id ? 0 : -1} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-admin-control px-2 text-sm transition-colors motion-reduce:transition-none ${tab === id ? 'admin-nav-active' : 'admin-nav-item'}`} onClick={() => selectTab(id)}><Icon size={17} aria-hidden="true" /><span className="whitespace-normal text-center">{label}</span></button>)}</div></div>{error != null ? <AdminAlert tone="danger">{error}</AdminAlert> : null}<AdminStatus level="secondary">{status[tab] === 'published' ? 'Опубликовано' : status[tab] === 'dirty' ? ADMIN_UI.unpublishedChanges : status[tab] === 'saved' ? ADMIN_UI.saved : ''}</AdminStatus>{tab === 'modal' ? <div role="status" className="rounded-admin-control border border-brand-primary/20 bg-brand-primary/[0.06] px-3 py-2 text-sm text-text-primary">Область публикации: модальные CTA на всём сайте</div> : null}{content}</AdminPageFrame>;
};

export default SitePage;
