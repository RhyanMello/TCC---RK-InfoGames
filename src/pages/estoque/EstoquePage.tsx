import { useState } from 'react';
import { api, withQuery } from '../../api/client';
import type { Produto } from '../../api/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ConfirmDelete } from '../../components/ConfirmDelete';
import { DataTable, type Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { RowActions } from '../../components/RowActions';
import { SearchField } from '../../components/SearchField';
import { useApi, useDebouncedValue } from '../../hooks/useApi';
import { formatBRL } from '../../utils/format';
import { ProdutoModal } from './ProdutoModal';

type Dialogo = { tipo: 'form'; produto?: Produto } | { tipo: 'excluir'; produto: Produto } | null;

export function EstoquePage() {
  const [busca, setBusca] = useState('');
  const q = useDebouncedValue(busca);
  const { data, loading, error, reload } = useApi<Produto[]>(withQuery('/produtos', q));
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  const columns: Column<Produto>[] = [
    { key: 'nome', header: 'Nome', width: 33.5, align: 'left', render: (p) => p.nome },
    { key: 'categoria', header: 'Categoria', width: 19.8, render: (p) => p.categoria },
    { key: 'estoque', header: 'Estoque', width: 14.8, render: (p) => p.estoque },
    {
      key: 'preco',
      header: 'Preço Venda/ Preço Compra',
      width: 18.9,
      render: (p) => `${formatBRL(p.preco)}/${p.custo === null ? '—' : formatBRL(p.custo)}`,
    },
    {
      key: 'acoes',
      header: 'Ações',
      width: 13,
      render: (p) => (
        <RowActions
          label={p.nome}
          onEdit={() => setDialogo({ tipo: 'form', produto: p })}
          onDelete={() => setDialogo({ tipo: 'excluir', produto: p })}
        />
      ),
    },
  ];

  return (
    <div className="rk-page rk-page--fixed">
      <PageHeader
        title="Estoque"
        size="lg"
        search={<SearchField value={busca} onChange={setBusca} />}
        action={
          <Button variant="header" onClick={() => setDialogo({ tipo: 'form' })}>
            Novo Produto
          </Button>
        }
      />
      <Card fill className="rk-page__table">
        <DataTable
          columns={columns}
          rows={data}
          rowKey={(p) => p.id}
          loading={loading}
          error={error}
          emptyMessage={q ? 'Nenhum produto encontrado para a pesquisa.' : 'Nenhum produto cadastrado.'}
        />
      </Card>

      {dialogo?.tipo === 'form' && <ProdutoModal produto={dialogo.produto} onClose={() => setDialogo(null)} onSaved={reload} />}
      {dialogo?.tipo === 'excluir' && (
        <ConfirmDelete
          title="Excluir Produto"
          message={`Deseja excluir o produto "${dialogo.produto.nome}" do estoque?`}
          successMessage="Produto excluído com sucesso."
          onConfirm={() => api.delete(`/produtos/${dialogo.produto.id}`)}
          onClose={() => setDialogo(null)}
          onDeleted={reload}
        />
      )}
    </div>
  );
}
