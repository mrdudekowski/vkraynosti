import type { SiteSeoDocument, SiteSeoPage } from '../../cms/siteSeoDocument';
import { AdminFieldLabel, AdminTextArea, AdminTextInput } from './AdminFields';

const PAGE_LABELS: Record<SiteSeoPage['key'], string> = {
  home: 'Главная', winter: 'Зимние туры', spring: 'Весенние туры', summer: 'Летние туры', fall: 'Осенние туры',
};

type SiteSeoSectionProps = { value: SiteSeoDocument; onChange: (value: SiteSeoDocument) => void };

const SiteSeoSection = ({ value, onChange }: SiteSeoSectionProps) => (
  <section className="flex flex-col gap-3">
    <div className="admin-editor-surface p-4">
      <h2 className="text-base font-semibold">SEO главной и сезонных страниц</h2>
      <p className="mt-1 text-sm text-text-muted">Редактируются только фиксированные страницы. Технические теги, адреса и индексируемость формируются автоматически.</p>
    </div>
    {value.pages.map((page) => (
      <details key={page.key} className="admin-editor-surface p-4" open={page.key === 'home'}>
        <summary className="cursor-pointer font-semibold">{PAGE_LABELS[page.key]} <span className="ml-2 text-sm font-normal text-text-muted">{page.path}</span></summary>
        <div className="mt-4 grid gap-3">
          <div className="grid gap-1.5"><AdminFieldLabel htmlFor={`site-seo-title-${page.key}`}>Title</AdminFieldLabel><AdminTextInput id={`site-seo-title-${page.key}`} maxLength={70} value={page.title} onChange={(event) => onChange({ ...value, pages: value.pages.map((item) => item.key === page.key ? { ...item, title: event.target.value } : item) })} /></div>
          <div className="grid gap-1.5"><AdminFieldLabel htmlFor={`site-seo-description-${page.key}`}>Meta description</AdminFieldLabel><AdminTextArea id={`site-seo-description-${page.key}`} rows={3} maxLength={180} value={page.description} onChange={(event) => onChange({ ...value, pages: value.pages.map((item) => item.key === page.key ? { ...item, description: event.target.value } : item) })} /></div>
          <div className="grid gap-1.5"><AdminFieldLabel htmlFor={`site-seo-h1-${page.key}`}>H1</AdminFieldLabel><AdminTextInput id={`site-seo-h1-${page.key}`} maxLength={100} value={page.h1} onChange={(event) => onChange({ ...value, pages: value.pages.map((item) => item.key === page.key ? { ...item, h1: event.target.value } : item) })} /></div>
          <div className="grid gap-1.5"><AdminFieldLabel htmlFor={`site-seo-keywords-${page.key}`}>Ключевые фразы для Яндекса</AdminFieldLabel><AdminTextArea id={`site-seo-keywords-${page.key}`} rows={2} value={page.keywords.join('\n')} onChange={(event) => onChange({ ...value, pages: value.pages.map((item) => item.key === page.key ? { ...item, keywords: event.target.value.split(/\n|,/).map((phrase) => phrase.trim()).filter(Boolean).slice(0, 8) } : item) })} placeholder="до 8 тематических фраз" /></div>
          <p className="text-xs text-text-muted">Фразы не должны повторять список городов и мест. Google meta keywords не использует.</p>
        </div>
      </details>
    ))}
  </section>
);

export default SiteSeoSection;
