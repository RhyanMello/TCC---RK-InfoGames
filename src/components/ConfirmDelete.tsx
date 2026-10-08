import { useState } from 'react';
import { ApiError } from '../api/client';
import { Modal } from './Modal';
import { useToast } from './Toast';

interface ConfirmDeleteProps {
  title: string;
  message: string;
  successMessage: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  onDeleted: () => void;
}

/** Confirmação de exclusão no mesmo modal dos formulários. */
export function ConfirmDelete({ title, message, successMessage, onConfirm, onClose, onDeleted }: ConfirmDeleteProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    setSubmitting(true);
    try {
      await onConfirm();
      toast(successMessage);
      onDeleted();
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível excluir.');
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose} onSubmit={confirmar} submitLabel="Excluir" submitting={submitting} error={error}>
      <p className="rk-modal__text">{message}</p>
    </Modal>
  );
}
