import { useState } from 'react';
import { METODOS_PAGAMENTO } from '../../../shared/constants.ts';
import { api } from '../../api/client';
import type { Cliente, Produto } from '../../api/types';
import { Combobox } from '../../components/form/Combobox';
import { Field, FormRow } from '../../components/form/Field';
import { DateInput, MoneyInput, SelectInput, TextInput } from '../../components/form/inputs';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { useApi } from '../../hooks/useApi';
import { useSubmit } from '../../hooks/useSubmit';
import { formatDateBR, parseDateBR, todayISO } from '../../utils/format';

interface VendaModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function VendaModal({ onClose, onSaved }: VendaModalProps) {
  const toast = useToast();
  const { data: clientes } = useApi<Cliente[]>('/clientes');
  const { data: produtos } = useApi<Produto[]>('/produtos');
  const { submitting, error, fieldErrors, run, track } = useSubmit();

  const [cliente, setCliente] = useState('');
  const [produto, setProduto] = useState('');
  const [pagamento, setPagamento] = useState('');
  const [data, setData] = useState(formatDateBR(todayISO()));
  const [valor, setValor] = useState<number | null>(null);
  const [detalhes, setDetalhes] = useState('');

  function escolherProduto(nome: string) {
    setProduto(nome);
    // Ao escolher um produto do estoque, sugere o preço de venda cadastrado.
    const p = produtos?.find((x) => x.nome === nome);
    if (p && valor === null) setValor(p.preco);
  }

  function salvar() {
    const dataISO = parseDateBR(data);
    const erros: Record<string, string> = {};
    if (!cliente.trim()) erros.cliente = 'Informe o cliente.';
    if (!produto.trim()) erros.produto = 'Informe o produto.';
    if (!pagamento) erros.pagamento = 'Selecione o método de pagamento.';
    if (!dataISO) erros.data = data ? 'Data inválida.' : 'Informe a data.';
    if (valor === null) erros.valor = 'Informe o valor.';

    return run(async () => {
      await api.post('/vendas', { cliente, produto, pagamento, data: dataISO, valor, detalhes });
      toast('Venda registrada com sucesso.');
      onSaved();
      onClose();
    }, erros);
  }

  return (
    <Modal title="Nova Venda" onClose={onClose} onSubmit={salvar} submitting={submitting} error={error}>
      <Field label="Cliente" required error={fieldErrors.cliente}>
        {(p) => (
          <Combobox
            {...p}
            value={cliente}
            onChange={track('cliente', setCliente)}
            options={clientes?.map((c) => c.nome) ?? []}
            newHint={(nome) => `"${nome}" será cadastrado como novo cliente.`}
          />
        )}
      </Field>
      <Field label="Produto" required error={fieldErrors.produto}>
        {(p) => <Combobox {...p} value={produto} onChange={track('produto', escolherProduto)} options={produtos?.map((x) => x.nome) ?? []} />}
      </Field>
      <FormRow>
        <Field label="Método de Pagamento" required error={fieldErrors.pagamento}>
          {(p) => <SelectInput {...p} options={METODOS_PAGAMENTO} value={pagamento} onChange={track('pagamento', setPagamento)} />}
        </Field>
        <Field label="Data" required error={fieldErrors.data}>
          {(p) => <DateInput {...p} value={data} onChange={track('data', setData)} />}
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Valor (R$)" required error={fieldErrors.valor} width={130}>
          {(p) => <MoneyInput {...p} value={valor} onChange={track('valor', setValor)} />}
        </Field>
      </FormRow>
      <Field label="Detalhes da Venda" error={fieldErrors.detalhes}>
        {(p) => <TextInput {...p} maxLength={500} value={detalhes} onChange={track('detalhes', setDetalhes)} />}
      </Field>
    </Modal>
  );
}
