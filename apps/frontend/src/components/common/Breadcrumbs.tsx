import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { generateBreadcrumbsSchema, type BreadcrumbItem } from '../../lib/seo/schema';

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showSchema?: boolean;
}

export function Breadcrumbs({ items, className = '', showSchema = true }: BreadcrumbsProps) {
  // Always include Home as first item if not present
  const fullItems: BreadcrumbItem[] =
    items.length > 0 && items[0].url === '/'
      ? items
      : [{ name: 'Home', url: '/' }, ...items];

  const schema = showSchema ? generateBreadcrumbsSchema(fullItems) : null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 text-xs font-sans text-[#6F6A63] ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1.5" role="list">
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1;
            return (
              <li key={item.url} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight
                    size={12}
                    className="text-[#DDD3C5] shrink-0"
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="text-[#171717] font-semibold truncate max-w-[200px] sm:max-w-[320px]"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    to={item.url}
                    className="hover:text-[#E6321C] transition-colors focus-visible:outline-none focus-visible:underline rounded"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
