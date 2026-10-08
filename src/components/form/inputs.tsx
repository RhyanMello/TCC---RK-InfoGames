import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { formatBRL, maskDateBR, parseBRLDigits } from '../../utils/format';
import { Icon } from '../Icon';

interface ControlProps {
  id: string;
  invalid: boolean;
  describedBy?: string;
}

const a11y = ({ id, invalid, describedBy }: ControlProps) => ({
  id,
  'aria-invalid': invalid || undefined,
  'aria-describedby': describedBy,
});

type TextInputProps = ControlProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange'> & {
  onChange: (value: string) => void;
};

export function TextInput({ id, invalid, describedBy, onChange, ...rest }: TextInputProps) {
  return <input className="rk-input" {...a11y({ id, invalid, describedBy })} {...rest} onChange={(e) => onChange(e.target.value)} />;
}

type TextAreaProps = ControlProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'onChange'> & {
  onChange: (value: string) => void;
};

export function TextArea({ id, invalid, describedBy, onChange, ...rest }: TextAreaProps) {
  return <textarea className="rk-input" {...a11y({ id, invalid, describedBy })} {...rest} onChange={(e) => onChange(e.target.value)} />;
}

type SelectInputProps = ControlProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'onChange'> & {
  options: readonly string[];
  onChange: (value: string) => void;
};

/** Select com a seta (chevron) do Figma. */
export function SelectInput({ id, invalid, describedBy, options, onChange, value, ...rest }: SelectInputProps) {
  return (
    <div className="rk-select">
      <select className="rk-input" {...a11y({ id, invalid, describedBy })} value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
        <option value="" disabled hidden />
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon name="chevron" width={16} height={14} className="rk-select__chevron" />
    </div>
  );
}

type MoneyInputProps = ControlProps & {
  /** Valor em centavos. */
  value: number | null;
  onChange: (centavos: number | null) => void;
};

/** Campo monetário no padrão brasileiro: digita-se apenas números e o valor é exibido como "R$ 0,00". */
export function MoneyInput({ value, onChange, ...control }: MoneyInputProps) {
  return (
    <input
      className="rk-input"
      {...a11y(control)}
      inputMode="numeric"
      placeholder="R$ 0,00"
      value={value === null ? '' : formatBRL(value)}
      onChange={(e) => onChange(parseBRLDigits(e.target.value))}
    />
  );
}

type DateInputProps = ControlProps & {
  /** Texto no formato DD/MM/AAAA. */
  value: string;
  onChange: (value: string) => void;
};

export function DateInput({ value, onChange, ...control }: DateInputProps) {
  return (
    <input
      className="rk-input"
      {...a11y(control)}
      inputMode="numeric"
      placeholder="DD/MM/AAAA"
      maxLength={10}
      value={value}
      onChange={(e) => onChange(maskDateBR(e.target.value))}
    />
  );
}
