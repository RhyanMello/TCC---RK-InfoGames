import { useEffect, useId, useRef, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import './Modal.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitting?: boolean;
  /** Erro geral do formulário (ex.: falha de conexão). */
  error?: string | null;
  children: ReactNode;
}

/** Modal dos formulários (Novo Produto, Nova Despesa, Nova Venda...): fundo escuro, cartão branco, Cancelar/Criar. */
export function Modal({ title, onClose, onSubmit, submitLabel = 'Criar', submitting, error, children }: ModalProps) {
  const titleId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    formRef.current?.querySelector<HTMLElement>('input, select, textarea')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return createPortal(
    <div className="rk-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form ref={formRef} className="rk-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onSubmit={handleSubmit} noValidate>
        <h2 id={titleId} className="rk-modal__title">
          {title}
        </h2>
        <button type="button" className="rk-modal__close" onClick={onClose} aria-label="Fechar">
          X
        </button>
        <div className="rk-modal__body">{children}</div>
        {error && (
          <p className="rk-modal__error" role="alert">
            {error}
          </p>
        )}
        <div className="rk-modal__footer">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
