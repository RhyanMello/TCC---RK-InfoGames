import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import './Toast.css';

type Tipo = 'sucesso' | 'erro';

interface ToastState {
  id: number;
  tipo: Tipo;
  mensagem: string;
}

const ToastContext = createContext<(mensagem: string, tipo?: Tipo) => void>(() => undefined);

/** Mensagens rápidas de sucesso/erro após salvar ou excluir. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((mensagem: string, tipo: Tipo = 'sucesso') => {
    const id = Date.now();
    setToast({ id, tipo, mensagem });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="rk-toast-region" role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`rk-toast rk-toast--${toast.tipo}`}>
            {toast.mensagem}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
