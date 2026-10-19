import { useState, type CSSProperties, type ReactNode } from 'react';
import { formatBRL, monthName, monthShort } from '../../utils/format';

const eixo = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Arredonda o topo do eixo para um múltiplo "bonito" dividido em 4 faixas (como R$0 ... R$10000 no Figma). */
function escala(max: number): number {
  const reais = Math.max(max / 100, 1);
  const passoBruto = reais / 4;
  const mag = 10 ** Math.floor(Math.log10(passoBruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= passoBruto) ?? 10 * mag;
  return passo * 4 * 100;
}

interface TooltipProps {
  titulo: string;
  linhas: [rotulo: string, valor: string][];
  cor?: string;
  className?: string;
  style?: CSSProperties;
}

/** Caixa com o valor exato de uma barra ou fatia, mostrada ao passar o mouse (ou tocar/focar). */
function ChartTooltip({ titulo, linhas, cor, className, style }: TooltipProps) {
  return (
    <div className={`rk-tooltip ${className ?? ''}`} style={style} role="tooltip">
      <strong className="rk-tooltip__title">
        {cor && <span className="rk-pie__swatch" style={{ background: cor }} />}
        {titulo}
      </strong>
      {linhas.map(([rotulo, valor]) => (
        <span key={rotulo} className="rk-tooltip__row">
          <span>{rotulo}</span>
          <b>{valor}</b>
        </span>
      ))}
    </div>
  );
}

/** Props para destacar um item ao passar o mouse, focar pelo teclado ou tocar na tela. */
function destaque(i: number, ativo: number | null, setAtivo: (i: number | null) => void, rotulo: string) {
  return {
    tabIndex: 0,
    'aria-label': rotulo,
    onMouseEnter: () => setAtivo(i),
    onMouseLeave: () => setAtivo(null),
    onFocus: () => setAtivo(i),
    onBlur: () => setAtivo(null),
    onClick: () => setAtivo(ativo === i ? null : i),
  };
}

/** "2026-04" -> "Abril de 2026". */
const tituloMes = (mes: string) => `${monthName(mes)} de ${mes.slice(0, 4)}`;

interface BarChartProps {
  data: { mes: string; total: number; vendas: number; servicos: number }[];
}

export function BarChart({ data }: BarChartProps) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const topo = escala(Math.max(...data.map((d) => d.total), 0));
  const ticks = [4, 3, 2, 1, 0].map((i) => (topo / 4) * i);
  const b = ativo !== null ? data[ativo] : null;
  const alturaB = b ? (b.total / topo) * 100 : 0;
  const centroB = (((ativo ?? 0) + 0.5) / data.length) * 100;

  return (
    <div className="rk-bars">
      <div className="rk-bars__axis">
        {ticks.map((t) => (
          <span key={t}>R${eixo.format(t / 100)}</span>
        ))}
      </div>
      <div className="rk-bars__plot">
        {data.map((d, i) => (
          <div key={d.mes} className="rk-bars__col">
            <div className="rk-bars__track">
              <div
                className={`rk-bars__bar ${ativo === i ? 'is-active' : ''}`}
                style={{ height: `${(d.total / topo) * 100}%` }}
                {...destaque(i, ativo, setAtivo, `${tituloMes(d.mes)}: ${formatBRL(d.total)}`)}
              />
            </div>
            <span className="rk-bars__label">{monthShort(d.mes)}</span>
          </div>
        ))}
        {b && (
          <ChartTooltip
            className={`rk-tooltip--bar ${alturaB > 55 ? 'rk-tooltip--inside' : ''}`}
            style={{
              // Centralizada na coluna, mas presa às bordas do gráfico para não ser cortada pelo cartão.
              left: `clamp(0px, calc(${centroB}% - var(--rk-tooltip-w) / 2), calc(100% - var(--rk-tooltip-w)))`,
              // Barras altas mostram a caixa por dentro, para ela não passar do topo do cartão.
              bottom: alturaB > 55 ? `calc(${alturaB}% - 8px)` : `calc(${alturaB}% + 8px)`,
            }}
            titulo={tituloMes(b.mes)}
            linhas={[
              ['Faturamento', formatBRL(b.total)],
              ['Vendas', formatBRL(b.vendas)],
              ['Serviços', formatBRL(b.servicos)],
            ]}
          />
        )}
      </div>
    </div>
  );
}

// Cores do gráfico de pizza do Figma.
const CORES = ['#ff9d00', '#77ff00', '#fff600', '#ff6a00', '#ffcf00', '#ffd900'];

interface PieChartProps {
  data: { categoria: string; total: number; qtd: number }[];
}

export function PieChart({ data }: PieChartProps) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.total, 0);
  if (!total) return <p className="rk-chart__empty">Nenhuma venda neste mês.</p>;

  const r = 85;
  let angulo = -Math.PI / 2;
  const fatias = data.map((d, i) => {
    const fracao = d.total / total;
    const inicio = angulo;
    angulo += fracao * Math.PI * 2;
    const meio = (inicio + angulo) / 2;
    const [x1, y1] = [Math.cos(inicio) * r, Math.sin(inicio) * r];
    const [x2, y2] = [Math.cos(angulo) * r, Math.sin(angulo) * r];
    const path =
      fracao >= 1
        ? `M ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 Z`
        : `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${fracao > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z`;
    // Ponto no meio da fatia (em % do quadro do SVG), onde a caixa de detalhes aparece.
    const centro = fracao >= 1 ? [0, 0] : [Math.cos(meio) * r * 0.55, Math.sin(meio) * r * 0.55];
    return {
      ...d,
      path,
      fracao,
      cor: CORES[i % CORES.length],
      pct: Math.round(fracao * 100),
      // Deslocamento da fatia destacada, para fora do centro.
      dx: fracao >= 1 ? 0 : Math.cos(meio) * 4,
      dy: fracao >= 1 ? 0 : Math.sin(meio) * 4,
      left: ((centro[0] + 88) / 176) * 100,
      // Limitada na vertical para a caixa não ser cortada pelas bordas do cartão.
      top: Math.min(Math.max(((centro[1] + 88) / 176) * 100, 24), 76),
      lado: centro[0] > 25 ? 'rk-tooltip--end' : centro[0] < -25 ? 'rk-tooltip--start' : '',
    };
  });
  const f = ativo !== null ? fatias[ativo] : null;

  let tooltip: ReactNode = null;
  if (f) {
    tooltip = (
      <ChartTooltip
        className={`rk-tooltip--pie ${f.lado}`}
        style={{ left: `${f.left}%`, top: `${f.top}%` }}
        cor={f.cor}
        titulo={f.categoria}
        linhas={[
          ['Valor', formatBRL(f.total)],
          ['Itens vendidos', String(f.qtd)],
          ['Participação', pct.format(f.fracao)],
        ]}
      />
    );
  }

  return (
    <div className="rk-pie">
      <ul className="rk-pie__legend">
        {fatias.map((s, i) => (
          <li
            key={s.categoria}
            className={ativo === i ? 'is-active' : ''}
            onMouseEnter={() => setAtivo(i)}
            onMouseLeave={() => setAtivo(null)}
          >
            <span className="rk-pie__swatch" style={{ background: s.cor }} />
            {s.categoria} ({s.pct}%)
          </li>
        ))}
      </ul>
      <div className="rk-pie__figure">
        <svg className="rk-pie__svg" viewBox="-88 -88 176 176" role="img" aria-label="Vendas por categoria">
          {fatias.map((s, i) => (
            <path
              key={s.categoria}
              className={`rk-pie__slice ${ativo !== null && ativo !== i ? 'is-dim' : ''}`}
              d={s.path}
              fill={s.cor}
              stroke="#fff"
              strokeWidth={2}
              strokeLinejoin="round"
              transform={ativo === i ? `translate(${s.dx} ${s.dy})` : undefined}
              {...destaque(i, ativo, setAtivo, `${s.categoria}: ${formatBRL(s.total)} (${pct.format(s.fracao)})`)}
            />
          ))}
        </svg>
        {tooltip}
      </div>
    </div>
  );
}
