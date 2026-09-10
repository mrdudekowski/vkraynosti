import { Link } from 'react-router-dom';
import { UI } from '../../constants/ui';
import SeasonLinkLabel from './SeasonLinkLabel';
import type { Season } from '../../types';

export interface BreadcrumbItem {
  label?: string;
  to?: string;
  season?: Season;
}

const getBreadcrumbKey = (item: BreadcrumbItem, index: number): string =>
  item.season ?? item.label ?? `item-${index}`;

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className = '' }: BreadcrumbsProps) => (
  <nav aria-label={UI.breadcrumbs.navLabel} className={className}>
    <ol className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
      {items.map((item, index) => (
        <li key={getBreadcrumbKey(item, index)} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-text-muted/60 select-none" aria-hidden>
              /
            </span>
          )}
          {item.to ? (
            <Link
              to={item.to}
              className={[
                'hover:text-brand-primary transition-colors duration-hover',
                item.season ? 'inline-flex items-center gap-1.5' : '',
              ].join(' ')}
              prefetch="intent"
            >
              {item.season ? <SeasonLinkLabel season={item.season} /> : item.label}
            </Link>
          ) : (
            <span
              className={[
                'text-text-primary font-medium',
                item.season ? 'inline-flex items-center gap-1.5' : '',
              ].join(' ')}
            >
              {item.season ? <SeasonLinkLabel season={item.season} /> : item.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
