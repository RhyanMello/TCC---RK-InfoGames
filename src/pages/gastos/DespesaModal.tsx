import { useState } from 'react';
import { TIPOS_DESPESA } from '../../../shared/constants.ts';
import { api } from '../../api/client';
import { Field, FormRow } from '../../components/form/Field';
import { MoneyInput, SelectInput, TextInput } from '../../components/form/inputs';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { useSubmit } from '../../hooks/useSubmit';

interface DespesaModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function DespesaModal({ onClose, onSaved }: DespesaModalProps) {
  const toast = useToast();
  const { submitting, error, fieldErrors, run, track } = useSubmit();
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState<number | null>(null);
  const [tipo, setTipo] = useState('');

  function salvar() {
    const erros: Record<string, string> = {};
    if (!nome.trim()) erros.nome = 'Informe o nome.';
    if (valor === null) erros.valor = 'Informe o valor.';
    if (!tipo) erros.tipo = 'Selecione o tipo.';

    return run(async () => {
      await api.post('/despesas', { nome, valor, tipo });
      toast('Despesa registrada com sucesso.');
      onSaved();
      onClose();
    }, erros);
  }

  return (
    <Modal title="Nova Despesa" onClose={onClose} onSubmit={salvar} submitting={submitting} error={error}>
      <Field label="Nome" required error={fieldErrors.nome}>
        {(p) => <TextInput {...p} maxLength={120} value={nome} onChange={track('nome', setNome)} />}
      </Field>
      <FormRow>
        <Field label="Valor (R$)" required error={fieldErrors.valor} width={130}>
          {(p) => <MoneyInput {...p} value={valor} onChange={track('valor', setValor)} />}
        </Field>
        <span className="rk-form-spacer" />
        <Field label="Tipo" required error={fieldErrors.tipo}>
          {(p) => <SelectInput {...p} options={TIPOS_DESPESA} value={tipo} onChange={track('tipo', setTipo)} />}
        </Field>
      </FormRow>
    </Modal>
  );
}
