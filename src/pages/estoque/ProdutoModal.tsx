import { useState } from 'react';
import { CATEGORIAS_PRODUTO } from '../../../shared/constants.ts';
import { api } from '../../api/client';
import type { Produto } from '../../api/types';
import { Field, FormRow } from '../../components/form/Field';
import { MoneyInput, SelectInput, TextInput } from '../../components/form/inputs';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { useSubmit } from '../../hooks/useSubmit';

interface ProdutoModalProps {
  produto?: Produto;
  onClose: () => void;
  onSaved: () => void;
}

export function ProdutoModal({ produto, onClose, onSaved }: ProdutoModalProps) {
  const toast = useToast();
  const { submitting, error, fieldErrors, run, track } = useSubmit();
  const [nome, setNome] = useState(produto?.nome ?? '');
  const [categoria, setCategoria] = useState<string>(produto?.categoria ?? '');
  const [sku, setSku] = useState(produto?.sku ?? '');
  const [preco, setPreco] = useState<number | null>(produto?.preco ?? null);
  const [custo, setCusto] = useState<number | null>(produto?.custo ?? null);
  const [estoque, setEstoque] = useState(produto ? String(produto.estoque) : '');

  function salvar() {
    const erros: Record<string, string> = {};
    if (!nome.trim()) erros.nome = 'Informe o nome.';
    if (!categoria) erros.categoria = 'Selecione a categoria.';
    if (preco === null) erros.preco = 'Informe o preço.';
    if (estoque === '') erros.estoque = 'Informe o estoque.';

    const body = { nome, categoria, sku, preco, custo, estoque: Number(estoque) };
    return run(async () => {
      if (produto) await api.put(`/produtos/${produto.id}`, body);
      else await api.post('/produtos', body);
      toast(produto ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.');
      onSaved();
      onClose();
    }, erros);
  }

  return (
    <Modal
      title={produto ? 'Editar Produto' : 'Novo Produto'}
      submitLabel={produto ? 'Salvar' : 'Criar'}
      onClose={onClose}
      onSubmit={salvar}
      submitting={submitting}
      error={error}
    >
      <Field label="Nome" required error={fieldErrors.nome}>
        {(p) => <TextInput {...p} maxLength={120} value={nome} onChange={track('nome', setNome)} />}
      </Field>
      <FormRow>
        <Field label="Categoria" error={fieldErrors.categoria}>
          {(p) => <SelectInput {...p} options={CATEGORIAS_PRODUTO} value={categoria} onChange={track('categoria', setCategoria)} />}
        </Field>
        <Field label="SKU" error={fieldErrors.sku}>
          {(p) => <TextInput {...p} maxLength={40} value={sku} onChange={track('sku', setSku)} />}
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Preço (R$)" required error={fieldErrors.preco}>
          {(p) => <MoneyInput {...p} value={preco} onChange={track('preco', setPreco)} />}
        </Field>
        <Field label="Custo (R$)" error={fieldErrors.custo}>
          {(p) => <MoneyInput {...p} value={custo} onChange={track('custo', setCusto)} />}
        </Field>
        <Field label="Estoque" required error={fieldErrors.estoque}>
          {(p) => <TextInput {...p} inputMode="numeric" value={estoque} onChange={track('estoque', (v: string) => setEstoque(v.replace(/\D/g, '')))} />}
        </Field>
      </FormRow>
    </Modal>
  );
}
