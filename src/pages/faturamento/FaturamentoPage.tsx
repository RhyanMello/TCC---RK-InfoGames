import { useState } from 'react';
import type { Dashboard } from '../../api/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DataTable, type Column } from '../../components/DataTable';
import { StatCard } from '../../components/StatCard';
import { useApi } from '../../hooks/useApi';
import { formatBRL, monthName } from '../../utils/format';
import { BarChart, PieChart } from './charts';
import { RelatorioModal } from './RelatorioModal';
import './FaturamentoPage.css';

type TopVenda = Dashboard['topVendas'][number];

export function FaturamentoPage() {
  const { data, loading, error } = useApi<Dashboard>('/dashboard');
  const [gerarRelatorio, setGerarRelatorio] = useState(false);

  const columns: Column<TopVenda>[] = [
    { key: 'produto', header: 'Produto', width: 55, align: 'left', render: (t) => t.produto },
    { key: 'qtd', header: 'Qtd', width: 10.8, render: (t) => t.qtd },
    { key: 'total', header: 'Total', width: 13.4, render: (t) => formatBRL(t.total) },
    { key: 'mes', header: 'Mês', width: 20.8, render: () => (data ? monthName(data.mes) : '') },
  ];

  return (
    <div className="rk-page rk-page--faturamento">
      <header className="rk-faturamento__header">
        <h1 className="rk-faturamento__title">Faturamento Mensal</h1>
        <Button variant="pill" className="rk-no-print" onClick={() => setGerarRelatorio(true)}>
          Gerar Relatório
        </Button>
      </header>

      <div className="rk-stats rk-faturamento__stats">
        <StatCard label="Faturamento mensal:" value={formatBRL(data?.faturamento ?? 0)} icon="card-dollar" />
        <StatCard label="Total de vendas no mês:" value={String(data?.totalVendas ?? 0)} icon="card-cart" />
        <StatCard label="Lucro total da empresa:" value={formatBRL(data?.lucro ?? 0)} icon="card-trend" />
        <StatCard label="Lucro como prestador de serviço:" value={formatBRL(data?.lucroServicos ?? 0)} icon="card-worker" compactLabel />
      </div>

      <div className="rk-faturamento__charts">
        <Card className="rk-chart">
          <h2 className="rk-chart__title">Faturamento Mensal</h2>
          {data && <BarChart data={data.faturamentoPorMes} />}
        </Card>
        <Card className="rk-chart">
          <h2 className="rk-chart__title">Vendas Por Categoria</h2>
          {data && <PieChart data={data.vendasPorCategoria} />}
        </Card>
      </div>

      <Card title="Top Vendas no Mês" className="rk-faturamento__top">
        <DataTable
          columns={columns}
          rows={data?.topVendas ?? null}
          rowKey={(t) => t.produto}
          loading={loading}
          error={error}
          emptyMessage="Nenhuma venda registrada neste mês."
          minWidth={560}
        />
      </Card>

      {gerarRelatorio && <RelatorioModal onClose={() => setGerarRelatorio(false)} />}
    </div>
  );
}
