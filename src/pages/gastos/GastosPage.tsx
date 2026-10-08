import { useState } from 'react';
import type { Despesa, DespesasResumo } from '../../api/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DataTable, type Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { useApi } from '../../hooks/useApi';
import { formatBRL } from '../../utils/format';
import { DespesaModal } from './DespesaModal';
import './GastosPage.css';

const columns: Column<Despesa>[] = [
  { key: 'nome', header: 'Nome', width: 68.6, align: 'left', render: (d) => d.nome },
  { key: 'valor', header: 'Valor', width: 31.4, align: 'left', className: 'rk-table__negative', render: (d) => `- ${formatBRL(d.valor)}` },
];

export function GastosPage() {
  const { data, loading, error, reload } = useApi<DespesasResumo>('/despesas');
  const [novaDespesa, setNovaDespesa] = useState(false);
  const valor = (centavos: number | undefined) => formatBRL(centavos ?? 0);

  return (
    <div className="rk-page rk-page--fixed rk-page--gastos">
      <PageHeader
        title="Gastos Mensais"
        size="lg"
        action={
          <Button variant="header" onClick={() => setNovaDespesa(true)}>
            Nova Despesa
          </Button>
        }
      />

      <div className="rk-stats rk-gastos__stats">
        <StatCard align="center" label="Despesas totais:" value={valor(data?.total)} />
        <StatCard align="center" label="Despesa com produtos:" value={valor(data?.porTipo.Produtos)} />
        <StatCard align="center" label="Despesa com contas:" value={valor(data?.porTipo.Contas)} />
        <StatCard align="center" label="Despesas com manutenção:" value={valor(data?.porTipo['Manutenção'])} />
      </div>

      <Card fill title="Relatório das Despesas" className="rk-gastos__report">
        <DataTable
          columns={columns}
          rows={data?.despesas ?? null}
          rowKey={(d) => d.id}
          loading={loading}
          error={error}
          emptyMessage="Nenhuma despesa registrada neste mês."
          minWidth={480}
        />
      </Card>

      {novaDespesa && <DespesaModal onClose={() => setNovaDespesa(false)} onSaved={reload} />}
    </div>
  );
}
