import type { ReactNode } from 'react';
import './DataTable.css';

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Largura da coluna em % da tabela, medida no Figma. */
  width: number;
  align?: 'left' | 'center';
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | null;
  rowKey: (row: T) => string | number;
  loading?: boolean;
  error?: string | null;
  emptyMessage: string;
  /** Largura mínima antes de rolar na horizontal (telas pequenas). */
  minWidth?: number;
}

export function DataTable<T>({ columns, rows, rowKey, loading, error, emptyMessage, minWidth = 860 }: DataTableProps<T>) {
  const status = error ?? (loading && !rows ? 'Carregando...' : rows && rows.length === 0 ? emptyMessage : null);

  return (
    <div className="rk-table-wrap">
      <table className="rk-table" style={{ minWidth }}>
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={{ width: `${c.width}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`rk-table__cell--${c.align ?? 'center'}`} scope="col">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.key} className={`rk-table__cell--${c.align ?? 'center'} ${c.className ?? ''}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {status && <p className={`rk-table__status ${error ? 'rk-table__status--error' : ''}`}>{status}</p>}
    </div>
  );
}
