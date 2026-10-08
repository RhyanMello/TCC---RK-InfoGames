import type { CSSProperties } from 'react';
import cardCart from '../assets/icons/card-cart.png';
import cardDollar from '../assets/icons/card-dollar.png';
import cardTrend from '../assets/icons/card-trend.png';
import cardWorker from '../assets/icons/card-worker.png';
import chevron from '../assets/icons/chevron.png';
import estoque from '../assets/icons/estoque.png';
import faturamento from '../assets/icons/faturamento.png';
import gastos from '../assets/icons/gastos.png';
import pencil from '../assets/icons/pencil.png';
import plus from '../assets/icons/plus.png';
import search from '../assets/icons/search.png';
import servicos from '../assets/icons/servicos.png';
import trash from '../assets/icons/trash.png';
import vendidos from '../assets/icons/vendidos.png';

// Ícones recortados do Figma; a cor vem de `color` (currentColor).
const icons = {
  faturamento,
  estoque,
  gastos,
  vendidos,
  servicos,
  pencil,
  trash,
  search,
  plus,
  chevron,
  'card-dollar': cardDollar,
  'card-cart': cardCart,
  'card-trend': cardTrend,
  'card-worker': cardWorker,
};

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  width: number;
  height?: number;
  className?: string;
}

export function Icon({ name, width, height = width, className }: IconProps) {
  const style = { width, height, '--icon': `url(${icons[name]})` } as CSSProperties;
  return <span aria-hidden="true" className={`rk-icon ${className ?? ''}`} style={style} />;
}
