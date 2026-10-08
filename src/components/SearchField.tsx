import { Icon } from './Icon';
import './SearchField.css';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function SearchField({ value, onChange, label = 'Pesquisar' }: SearchFieldProps) {
  return (
    <label className="rk-search">
      <Icon name="search" width={22} className="rk-search__icon" />
      <span className="sr-only">{label}</span>
      <input
        type="text"
        enterKeyHint="search"
        className="rk-search__input"
        placeholder="Pesquisar"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
