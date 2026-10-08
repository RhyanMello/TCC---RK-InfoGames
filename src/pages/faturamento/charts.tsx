import { formatBRL, monthShort } from '../../utils/format';

const eixo = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

/** Arredonda o topo do eixo para um múltiplo "bonito" dividido em 4 faixas (como R$0 ... R$10000 no Figma). */
function escala(max: number): number {
  const reais = Math.max(max / 100, 1);
  const passoBruto = reais / 4;
  const mag = 10 ** Math.floor(Math.log10(passoBruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= passoBruto) ?? 10 * mag;
  return passo * 4 * 100;
}

interface BarChartProps {
  data: { mes: string; total: number }[];
}

export function BarChart({ data }: BarChartProps) {
  const topo = escala(Math.max(...data.map((d) => d.total), 0));
  const ticks = [4, 3, 2, 1, 0].map((i) => (topo / 4) * i);

  return (
    <div className="rk-bars">
      <div className="rk-bars__axis">
        {ticks.map((t) => (
          <span key={t}>R${eixo.format(t / 100)}</span>
        ))}
      </div>
      <div className="rk-bars__plot">
        {data.map((d) => (
          <div key={d.mes} className="rk-bars__col">
            <div className="rk-bars__track">
              <div
                className="rk-bars__bar"
                style={{ height: `${(d.total / topo) * 100}%` }}
                title={`${monthShort(d.mes)} ${formatBRL(d.total)}`}
              />
            </div>
            <span className="rk-bars__label">{monthShort(d.mes)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cores do gráfico de pizza do Figma.
const CORES = ['#ff9d00', '#77ff00', '#fff600', '#ff6a00', '#ffcf00', '#ffd900'];

interface PieChartProps {
  data: { categoria: string; total: number }[];
}

export function PieChart({ data }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.total, 0);
  if (!total) return <p className="rk-chart__empty">Nenhuma venda neste mês.</p>;

  const r = 85;
  let angulo = -Math.PI / 2;
  const fatias = data.map((d, i) => {
    const fracao = d.total / total;
    const inicio = angulo;
    angulo += fracao * Math.PI * 2;
    const [x1, y1] = [Math.cos(inicio) * r, Math.sin(inicio) * r];
    const [x2, y2] = [Math.cos(angulo) * r, Math.sin(angulo) * r];
    const path =
      fracao >= 1
        ? `M ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 Z`
        : `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${fracao > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z`;
    return { ...d, path, cor: CORES[i % CORES.length], pct: Math.round(fracao * 100) };
  });

  return (
    <div className="rk-pie">
      <ul className="rk-pie__legend">
        {fatias.map((f) => (
          <li key={f.categoria}>
            <span className="rk-pie__swatch" style={{ background: f.cor }} />
            {f.categoria} ({f.pct}%)
          </li>
        ))}
      </ul>
      <svg className="rk-pie__svg" viewBox="-88 -88 176 176" role="img" aria-label="Vendas por categoria">
        {fatias.map((f) => (
          <path key={f.categoria} d={f.path} fill={f.cor} stroke="#fff" strokeWidth={2} strokeLinejoin="round">
            <title>{`${f.categoria}: ${formatBRL(f.total)} (${f.pct}%)`}</title>
          </path>
        ))}
      </svg>
    </div>
  );
}
