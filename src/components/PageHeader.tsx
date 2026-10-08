import type { ReactNode } from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  /** "lg" = 40px (Estoque, Gastos Mensais); "md" = 24px (Produtos Vendidos, Serviços Prestados). */
  size?: 'lg' | 'md';
  search?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, size = 'md', search, action }: PageHeaderProps) {
  return (
    <header className={`rk-page-header rk-page-header--${size}`}>
      <h1 className="rk-page-header__title">{title}</h1>
      {search && <div className="rk-page-header__search">{search}</div>}
      {action && <div className="rk-page-header__action rk-no-print">{action}</div>}
    </header>
  );
}
