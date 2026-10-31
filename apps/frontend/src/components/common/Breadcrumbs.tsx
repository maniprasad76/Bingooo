import { Link } from 'react-router-dom';
import { generateBreadcrumbsSchema, toJsonLd, type BreadcrumbItem } from '../../lib/seo/schema';

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
          dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }}
        />
      )}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#6F6A63] ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1.5" role="list">
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1;
            return (
              <li key={item.url} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span className="text-[#171717]/40 font-bold px-0.5" aria-hidden="true">/</span>
                )}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="border border-[#171717] bg-white text-[#171717] px-2 py-0.5 rounded-[2px] font-black truncate max-w-[200px] sm:max-w-[320px] shadow-[1px_1px_0px_#171717]"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    to={item.url}
                    className="font-bold text-[#6F6A63] hover:text-[#E6321C] transition-colors focus-visible:outline-none"
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
