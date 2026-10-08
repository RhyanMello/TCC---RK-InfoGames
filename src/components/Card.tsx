import type { ReactNode } from 'react';
import './Card.css';

interface CardProps {
  title?: string;
  /** Ocupa a altura restante da página (tabelas principais). */
  fill?: boolean;
  className?: string;
  children: ReactNode;
}

/** Container branco com borda #CCC5C5 e cantos de 8px usado pelas tabelas e gráficos. */
export function Card({ title, fill, className, children }: CardProps) {
  return (
    <section className={`rk-card ${fill ? 'rk-card--fill' : ''} ${className ?? ''}`}>
      {title && <h2 className="rk-card__title">{title}</h2>}
      {children}
    </section>
  );
}
