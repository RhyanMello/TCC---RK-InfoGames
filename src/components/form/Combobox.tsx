import { useId, useMemo, useState, type KeyboardEvent } from 'react';

interface ComboboxProps {
  id: string;
  invalid: boolean;
  describedBy?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  /** Texto exibido quando o valor digitado ainda não existe na lista. */
  newHint?: (value: string) => string;
}

/** Campo de texto com lista de sugestões (seleciona um cliente/produto existente ou digita um novo). */
export function Combobox({ id, invalid, describedBy, value, onChange, options, newHint }: ComboboxProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const filtradas = useMemo(() => {
    const termo = value.trim().toLocaleLowerCase('pt-BR');
    return options.filter((o) => o.toLocaleLowerCase('pt-BR').includes(termo)).slice(0, 50);
  }, [options, value]);

  const existe = options.some((o) => o.toLocaleLowerCase('pt-BR') === value.trim().toLocaleLowerCase('pt-BR'));
  const mostrar = open && (filtradas.length > 0 || (value.trim() && !existe && newHint));

  function escolher(opcao: string) {
    onChange(opcao);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, filtradas.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && mostrar && filtradas[active]) {
      e.preventDefault();
      escolher(filtradas[active]);
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      setOpen(false);
    }
  }

  return (
    <div className="rk-combobox">
      <input
        id={id}
        className="rk-input"
        role="combobox"
        autoComplete="off"
        aria-expanded={Boolean(mostrar)}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-activedescendant={mostrar && filtradas[active] ? `${listId}-${active}` : undefined}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {mostrar && (
        <ul id={listId} className="rk-combobox__list" role="listbox">
          {filtradas.map((o, i) => (
            <li
              key={o}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`rk-combobox__option ${i === active ? 'rk-combobox__option--active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                escolher(o);
              }}
              onMouseEnter={() => setActive(i)}
            >
              {o}
            </li>
          ))}
          {value.trim() && !existe && newHint && <li className="rk-combobox__hint">{newHint(value.trim())}</li>}
        </ul>
      )}
    </div>
  );
}
