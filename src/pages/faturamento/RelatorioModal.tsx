import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Field } from '../../components/form/Field';
import { SelectInput } from '../../components/form/inputs';
import { Modal } from '../../components/Modal';
import { useApi } from '../../hooks/useApi';
import { monthName } from '../../utils/format';

interface RelatorioModalProps {
  onClose: () => void;
}

const rotulo = (anoMes: string) => `${monthName(anoMes)} de ${anoMes.slice(0, 4)}`;

/** Escolha do mês antes de gerar o relatório (mesmo modal dos cadastros). */
export function RelatorioModal({ onClose }: RelatorioModalProps) {
  const navigate = useNavigate();
  const { data: meses, error } = useApi<string[]>('/relatorio/meses');
  const [mes, setMes] = useState('');
  const selecionado = mes || meses?.[0] || '';

  return (
    <Modal
      title="Gerar Relatório"
      submitLabel="Gerar"
      onClose={onClose}
      onSubmit={() => selecionado && navigate(`/relatorio/${selecionado}`)}
      error={error}
    >
      <Field label="Mês do relatório" required>
        {(p) => (
          <SelectInput
            {...p}
            options={meses?.map(rotulo) ?? []}
            value={selecionado ? rotulo(selecionado) : ''}
            onChange={(r) => setMes(meses?.find((m) => rotulo(m) === r) ?? '')}
          />
        )}
      </Field>
    </Modal>
  );
}
