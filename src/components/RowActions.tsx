import { Icon } from './Icon';

interface RowActionsProps {
  /** Nome do item, usado no texto acessível dos botões. */
  label: string;
  onEdit?: () => void;
  onDelete: () => void;
}

/** Lápis (editar) e lixeira vermelha (excluir), como na tabela de Estoque. */
export function RowActions({ label, onEdit, onDelete }: RowActionsProps) {
  return (
    <span className="rk-table__actions rk-no-print">
      {onEdit && (
        <button type="button" className="rk-icon-btn" onClick={onEdit} title="Editar" aria-label={`Editar ${label}`}>
          <Icon name="pencil" width={20} />
        </button>
      )}
      <button
        type="button"
        className="rk-icon-btn rk-icon-btn--danger"
        onClick={onDelete}
        title="Excluir"
        aria-label={`Excluir ${label}`}
      >
        <Icon name="trash" width={19} height={24} />
      </button>
    </span>
  );
}
