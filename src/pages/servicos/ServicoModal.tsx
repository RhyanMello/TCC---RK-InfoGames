import { useState } from 'react';
import { TIPOS_SERVICO } from '../../../shared/constants.ts';
import { api } from '../../api/client';
import type { Cliente, Servico, ServicoInput } from '../../api/types';
import { Combobox } from '../../components/form/Combobox';
import { Field, FormRow } from '../../components/form/Field';
import { DateInput, MoneyInput, SelectInput, TextArea } from '../../components/form/inputs';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { useApi } from '../../hooks/useApi';
import { useSubmit } from '../../hooks/useSubmit';
import { formatDateBR, parseDateBR, todayISO } from '../../utils/format';

interface ServicoModalProps {
  /** Serviço em edição; sem ele o modal cadastra um novo. */
  servico?: Servico;
  onClose: () => void;
  onSaved: () => void;
}

export function ServicoModal({ servico, onClose, onSaved }: ServicoModalProps) {
  const toast = useToast();
  const { data: clientes } = useApi<Cliente[]>('/clientes');
  const { submitting, error, fieldErrors, run, track } = useSubmit();

  const [cliente, setCliente] = useState(servico?.cliente_nome ?? '');
  const [tipo, setTipo] = useState<string>(servico?.tipo ?? '');
  const [valor, setValor] = useState<number | null>(servico?.valor ?? null);
  const [data, setData] = useState(formatDateBR(servico?.data ?? todayISO()));
  const [descricao, setDescricao] = useState(servico?.descricao ?? '');

  function salvar() {
    const dataISO = parseDateBR(data);
    const erros: Record<string, string> = {};
    if (!cliente.trim()) erros.cliente = 'Informe o cliente.';
    if (!tipo) erros.tipo = 'Selecione o tipo de serviço.';
    if (valor === null) erros.valor = 'Informe o valor.';
    if (!dataISO) erros.data = data ? 'Data inválida.' : 'Informe a data.';

    const body: ServicoInput = { cliente: cliente.trim(), tipo, valor, data: dataISO ?? '', descricao: descricao.trim() };
    return run(async () => {
      if (servico) await api.put(`/servicos/${servico.id}`, body);
      else await api.post('/servicos', body);
      toast(servico ? 'Serviço atualizado com sucesso.' : 'Serviço cadastrado com sucesso.');
      onSaved();
      onClose();
    }, erros);
  }

  return (
    <Modal
      title={servico ? 'Editar Serviço' : 'Novo Serviço'}
      submitLabel={servico ? 'Salvar' : 'Criar'}
      onClose={onClose}
      onSubmit={salvar}
      submitting={submitting}
      error={error}
    >
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
      <FormRow>
        <Field label="Tipo de Serviço" required error={fieldErrors.tipo}>
          {(p) => <SelectInput {...p} options={TIPOS_SERVICO} value={tipo} onChange={track('tipo', setTipo)} />}
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
      <Field label="Descrição do Serviço" error={fieldErrors.descricao}>
        {(p) => (
          <TextArea
            {...p}
            rows={3}
            maxLength={1000}
            placeholder="Ex.: Formatação e instalação do Windows"
            value={descricao}
            onChange={track('descricao', setDescricao)}
          />
        )}
      </Field>
    </Modal>
  );
}
