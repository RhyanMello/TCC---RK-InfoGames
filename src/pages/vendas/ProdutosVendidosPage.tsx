import { useState } from 'react';
import { api, withQuery } from '../../api/client';
import type { Venda } from '../../api/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ConfirmDelete } from '../../components/ConfirmDelete';
import { DataTable, type Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { RowActions } from '../../components/RowActions';
import { SearchField } from '../../components/SearchField';
import { useApi, useDebouncedValue } from '../../hooks/useApi';
import { formatBRL, formatDateBR } from '../../utils/format';
import { VendaModal } from './VendaModal';

type Dialogo = { tipo: 'nova' } | { tipo: 'excluir'; venda: Venda } | null;

export function ProdutosVendidosPage() {
  const [busca, setBusca] = useState('');
  const q = useDebouncedValue(busca);
  const { data, loading, error, reload } = useApi<Venda[]>(withQuery('/vendas', q));
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  const columns: Column<Venda>[] = [
    { key: 'nome', header: 'Nome', width: 33.5, align: 'left', render: (v) => v.produto_nome },
    { key: 'pagamento', header: 'Pagamento', width: 19, render: (v) => v.pagamento },
    { key: 'qtd', header: 'Qtd', width: 16.2, render: (v) => v.qtd },
    { key: 'valor', header: 'Valor Venda', width: 11.4, render: (v) => formatBRL(v.valor) },
    { key: 'data', header: 'Data', width: 15.5, className: 'rk-table__muted', render: (v) => formatDateBR(v.data) },
    {
      key: 'acoes',
      header: <span className="sr-only">Ações</span>,
      width: 4.4,
      render: (v) => <RowActions label={`venda de ${v.produto_nome}`} onDelete={() => setDialogo({ tipo: 'excluir', venda: v })} />,
    },
  ];

  return (
    <div className="rk-page rk-page--fixed">
      <PageHeader
        title="Produtos Vendidos"
        search={<SearchField value={busca} onChange={setBusca} />}
        action={
          <Button variant="header" onClick={() => setDialogo({ tipo: 'nova' })}>
            Nova Venda
          </Button>
        }
      />
      <Card fill className="rk-page__table">
        <DataTable
          columns={columns}
          rows={data}
          rowKey={(v) => v.id}
          loading={loading}
          error={error}
          emptyMessage={q ? 'Nenhuma venda encontrada para a pesquisa.' : 'Nenhuma venda registrada.'}
        />
      </Card>

      {dialogo?.tipo === 'nova' && <VendaModal onClose={() => setDialogo(null)} onSaved={reload} />}
      {dialogo?.tipo === 'excluir' && (
        <ConfirmDelete
          title="Excluir Venda"
          message={`Deseja excluir a venda de "${dialogo.venda.produto_nome}" para ${dialogo.venda.cliente_nome}?`}
          successMessage="Venda excluída com sucesso."
          onConfirm={() => api.delete(`/vendas/${dialogo.venda.id}`)}
          onClose={() => setDialogo(null)}
          onDeleted={reload}
        />
      )}
    </div>
  );
}
