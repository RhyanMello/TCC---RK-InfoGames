import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { EstoquePage } from './pages/estoque/EstoquePage';
import { FaturamentoPage } from './pages/faturamento/FaturamentoPage';
import { GastosPage } from './pages/gastos/GastosPage';
import { LoginPage } from './pages/login/LoginPage';
import { ServicosPage } from './pages/servicos/ServicosPage';
import { ProdutosVendidosPage } from './pages/vendas/ProdutosVendidosPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/faturamento', element: <FaturamentoPage /> },
      { path: '/estoque', element: <EstoquePage /> },
      { path: '/gastos', element: <GastosPage /> },
      { path: '/produtos-vendidos', element: <ProdutosVendidosPage /> },
      { path: '/servicos', element: <ServicosPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/faturamento" replace /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
