import { useId, type ReactNode } from 'react';
import './form.css';

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  /** Largura fixa em px (ex.: 130 para os campos de valor do Figma). Sem valor, ocupa o espaço disponível. */
  width?: number;
  children: (props: { id: string; invalid: boolean; describedBy?: string }) => ReactNode;
}

export function Field({ label, required, error, width, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-erro`;
  return (
    <div className="rk-field" style={width ? { flex: `0 1 ${width}px` } : undefined}>
      <label className="rk-field__label" htmlFor={id}>
        {label}
        {required && '*'}
      </label>
      {children({ id, invalid: Boolean(error), describedBy: error ? errorId : undefined })}
      {error && (
        <span id={errorId} className="rk-field__error">
          {error}
        </span>
      )}
    </div>
  );
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="rk-form-row">{children}</div>;
}
