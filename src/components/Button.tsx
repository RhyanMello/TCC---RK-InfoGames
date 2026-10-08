import type { ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';
import './Button.css';

type Variant =
  | 'header' // botão amarelo do cabeçalho com "+" (Novo Produto, Nova Venda...)
  | 'pill' // botão amarelo arredondado (Gerar Relatório)
  | 'primary' // "Criar" dos modais
  | 'secondary'; // "Cancelar" dos modais

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant;
}

export function Button({ variant, children, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={`rk-btn rk-btn--${variant} ${className ?? ''}`} {...rest}>
      {variant === 'header' && <Icon name="plus" width={14} className="rk-btn__plus" />}
      {children}
    </button>
  );
}
