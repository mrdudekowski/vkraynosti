import type { CmsTourSeo } from '../../cms/cmsTourDocument';
import { AdminFieldLabel, AdminTextArea, AdminTextInput } from './AdminFields';

type TourSeoSectionProps = {
  title: string;
  imageUrl: string;
  value: CmsTourSeo;
  onChange: (value: CmsTourSeo) => void;
};

const TourSeoSection = ({ title, imageUrl, value, onChange }: TourSeoSectionProps) => {
  const keywordsText = (value.keywords ?? []).join('\n');
  return (
    <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
      <div className="admin-editor-surface flex flex-col gap-3 p-4">
        <div>
          <h2 className="text-base font-semibold">SEO страницы тура</h2>
          <p className="mt-1 text-sm text-text-muted">Поля управляют поисковым сниппетом и заголовком страницы. Маршрут, индексируемость и canonical задаются системой.</p>
        </div>
        <div className="grid gap-1.5">
          <AdminFieldLabel htmlFor="tour-seo-title">Title</AdminFieldLabel>
          <AdminTextInput id="tour-seo-title" maxLength={70} value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} placeholder={`${title} — тур из Владивостока | Вкрайности`} />
          <span className="text-xs text-text-muted">{value.title.length}/70 символов. Если поле пустое, используется название тура.</span>
        </div>
        <div className="grid gap-1.5">
          <AdminFieldLabel htmlFor="tour-seo-description">Meta description</AdminFieldLabel>
          <AdminTextArea id="tour-seo-description" rows={4} maxLength={180} value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} placeholder="Маршрут, сезон, длительность, ключевые места и отправление из Владивостока." />
          <span className="text-xs text-text-muted">{value.description.length}/180 символов. Пишите конкретно и только подтверждённые факты.</span>
        </div>
        <div className="grid gap-1.5">
          <AdminFieldLabel htmlFor="tour-seo-h1">H1 на странице</AdminFieldLabel>
          <AdminTextInput id="tour-seo-h1" maxLength={100} value={value.h1} onChange={(event) => onChange({ ...value, h1: event.target.value })} placeholder={title} />
        </div>
        <div className="grid gap-1.5">
          <AdminFieldLabel htmlFor="tour-seo-keywords">Ключевые фразы для Яндекса</AdminFieldLabel>
          <AdminTextArea id="tour-seo-keywords" rows={3} value={keywordsText} onChange={(event) => onChange({ ...value, keywords: event.target.value.split(/\n|,/).map((phrase) => phrase.trim()).filter(Boolean).slice(0, 8) })} placeholder="поездка на полуостров…\nэкскурсия из Владивостока…" />
          <span className="text-xs text-text-muted">До 8 точных фраз без повторов и перечня всех географических названий. Google не учитывает этот тег.</span>
        </div>
      </div>
      <aside className="admin-editor-surface flex flex-col gap-3 p-4" aria-label="Предпросмотр сниппета">
        <h2 className="text-base font-semibold">Предпросмотр</h2>
        {imageUrl ? <img src={imageUrl} alt="" className="aspect-video w-full rounded-admin-control object-cover" /> : null}
        <div className="rounded-admin-control border border-divider p-3">
          <p className="text-xs text-text-muted">vkraynosti.ru</p>
          <p className="mt-1 text-base text-brand-primary">{value.title.trim() || `${title} | Вкрайности`}</p>
          <p className="mt-1 text-sm text-text-secondary">{value.description.trim() || 'Описание будет сформировано из опубликованных данных тура.'}</p>
        </div>
      </aside>
    </section>
  );
};

export default TourSeoSection;
