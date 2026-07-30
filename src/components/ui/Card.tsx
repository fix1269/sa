import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 ${className}`}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
}

export function PageHeader({ title, description, icon, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && <div className="mb-3">{breadcrumbs}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-slate-300 dark:text-slate-600 mb-3">{icon}</div>}
      <p className="text-slate-400 dark:text-slate-500 text-sm">{message}</p>
    </div>
  );
}

interface BreadcrumbsProps {
  items: { label: string; onClick?: () => void }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-1.5 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-slate-900 dark:text-white font-medium px-1.5 py-0.5">
              {item.label}
            </span>
          )}
          {i < items.length - 1 && (
            <span className="text-slate-300 dark:text-slate-600">/</span>
          )}
        </span>
      ))}
    </nav>
  );
}
