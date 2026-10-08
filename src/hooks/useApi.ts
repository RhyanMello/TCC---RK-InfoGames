import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';

/** Carrega um recurso da API e expõe `reload` para atualizar após criar/editar/excluir. */
export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    api
      .get<T>(url)
      .then((res) => {
        if (!ativo) return;
        setData(res);
        setError(null);
      })
      .catch((e: unknown) => ativo && setError(e instanceof ApiError ? e.message : 'Erro ao carregar os dados.'))
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [url, versao]);

  const reload = useCallback(() => setVersao((v) => v + 1), []);
  return { data, error, loading, reload };
}

export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
