import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../api/client';
import { clearSessao } from '../auth/session';
import { useSessao } from '../auth/useSessao';
import { Sidebar } from './Sidebar';
import { ToastProvider } from './Toast';
import './AppLayout.css';

export function AppLayout() {
  const sessao = useSessao();
  if (!sessao) return <Navigate to="/login" replace />;

  async function sair() {
    await api.post('/auth/logout', {}).catch(() => undefined);
    clearSessao();
  }

  return (
    <ToastProvider>
      <Sidebar userName={sessao.usuario.nome} onLogout={sair} />
      <main className="rk-main">
        <Outlet />
      </main>
    </ToastProvider>
  );
}
