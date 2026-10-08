import { Icon, type IconName } from './Icon';
import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string;
  icon?: IconName;
  /** "left" no Faturamento Mensal; "center" nos cards de Gastos Mensais. */
  align?: 'left' | 'center';
  /** Rótulos longos usam 10px no Figma (ex.: "Lucro como prestador de serviço"). */
  compactLabel?: boolean;
}

export function StatCard({ label, value, icon, align = 'left', compactLabel }: StatCardProps) {
  return (
    <div className={`rk-stat rk-stat--${align}`}>
      <span className={`rk-stat__label ${compactLabel ? 'rk-stat__label--compact' : ''}`}>{label}</span>
      <strong className="rk-stat__value">{value}</strong>
      {icon && <Icon name={icon} width={36} className="rk-stat__icon" />}
    </div>
  );
}
