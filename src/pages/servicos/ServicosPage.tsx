import { useState } from 'react';
import { api, withQuery } from '../../api/client';
import type { Servico } from '../../api/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ConfirmDelete } from '../../components/ConfirmDelete';
import { DataTable, type Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { RowActions } from '../../components/RowActions';
import { SearchField } from '../../components/SearchField';
import { useApi, useDebouncedValue } from '../../hooks/useApi';
import { formatBRL, formatDateBR } from '../../utils/format';
import { ServicoModal } from './ServicoModal';

type Dialogo = { tipo: 'form'; servico?: Servico } | { tipo: 'excluir'; servico: Servico } | null;

export function ServicosPage() {
  const [busca, setBusca] = useState('');
  const q = useDebouncedValue(busca);
  const { data, loading, error, reload } = useApi<Servico[]>(withQuery('/servicos', q));
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  // Mesmo layout da tabela de Produtos Vendidos, com as ações (editar/excluir) da tabela de Estoque.
  const columns: Column<Servico>[] = [
    { key: 'cliente', header: 'Cliente', width: 20, align: 'left', render: (s) => s.cliente_nome },
    { key: 'tipo', header: 'Tipo', width: 13, render: (s) => s.tipo },
    { key: 'data', header: 'Data', width: 11, className: 'rk-table__muted', render: (s) => formatDateBR(s.data) },
    {
      key: 'descricao',
      header: 'Descrição',
      width: 32,
      align: 'left',
      render: (s) => <span title={s.descricao}>{s.descricao || '—'}</span>,
    },
    { key: 'valor', header: 'Valor', width: 13, render: (s) => formatBRL(s.valor) },
    {
      key: 'acoes',
      header: 'Ações',
      width: 11,
      render: (s) => (
        <RowActions
          label={`serviço de ${s.cliente_nome}`}
          onEdit={() => setDialogo({ tipo: 'form', servico: s })}
          onDelete={() => setDialogo({ tipo: 'excluir', servico: s })}
        />
      ),
    },
  ];

  return (
    <div className="rk-page rk-page--fixed">
      <PageHeader
        title="Serviços Prestados"
        search={<SearchField value={busca} onChange={setBusca} />}
        action={
          <Button variant="header" onClick={() => setDialogo({ tipo: 'form' })}>
            Novo Serviço
          </Button>
        }
      />

      <Card fill className="rk-page__table">
        <DataTable
          columns={columns}
          rows={data}
          rowKey={(s) => s.id}
          loading={loading}
          error={error}
          emptyMessage={q ? 'Nenhum serviço encontrado para a pesquisa.' : 'Nenhum serviço cadastrado.'}
        />
      </Card>

      {dialogo?.tipo === 'form' && <ServicoModal servico={dialogo.servico} onClose={() => setDialogo(null)} onSaved={reload} />}
      {dialogo?.tipo === 'excluir' && (
        <ConfirmDelete
          title="Excluir Serviço"
          message={`Deseja excluir o serviço "${dialogo.servico.descricao || dialogo.servico.tipo}" de ${dialogo.servico.cliente_nome}?`}
          successMessage="Serviço excluído com sucesso."
          onConfirm={() => api.delete(`/servicos/${dialogo.servico.id}`)}
          onClose={() => setDialogo(null)}
          onDeleted={reload}
        />
      )}
    </div>
  );
}
