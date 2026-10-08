import { useState } from 'react';
import { ApiError } from '../api/client';

/** Controla envio de formulários: estado de carregamento, erro geral e erros por campo vindos da API. */
export function useSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function run(action: () => Promise<void>, localErrors: Record<string, string> = {}) {
    setFieldErrors(localErrors);
    if (Object.keys(localErrors).length) {
      setError(null);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      if (e instanceof ApiError) {
        setFieldErrors(e.fields);
        setError(Object.keys(e.fields).length ? null : e.message);
      } else {
        setError('Não foi possível salvar.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  /** Envolve o setter de um campo para apagar o erro dele assim que o usuário o altera. */
  function track<T>(campo: string, setter: (valor: T) => void) {
    return (valor: T) => {
      setter(valor);
      setFieldErrors((erros) => {
        if (!(campo in erros)) return erros;
        const { [campo]: _removido, ...resto } = erros;
        return resto;
      });
    };
  }

  return { submitting, error, fieldErrors, run, track };
}
