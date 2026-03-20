import { Link } from 'react-router-dom';
import { UI } from '../../constants/ui';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className = '' }: BreadcrumbsProps) => (
  <nav aria-label={UI.breadcrumbs.navLabel} className={className}>
    <ol className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-text-muted/60 select-none" aria-hidden>
              /
            </span>
          )}
          {item.to ? (
            <Link
              to={item.to}
              className="hover:text-brand-primary transition-colors duration-hover"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary font-medium">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
