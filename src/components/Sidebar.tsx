import { NavLink } from 'react-router-dom';
import logo from '../assets/logo-rk.png';
import { Icon, type IconName } from './Icon';
import './Sidebar.css';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  iconSize: [number, number];
}

// Ordem, rótulos e tamanhos dos ícones conforme a sidebar do Figma.
const NAV: NavItem[] = [
  { to: '/faturamento', label: 'Faturamento Mensal', icon: 'faturamento', iconSize: [27, 27] },
  { to: '/estoque', label: 'Estoque', icon: 'estoque', iconSize: [26, 27] },
  { to: '/gastos', label: 'Gastos Mensais', icon: 'gastos', iconSize: [27, 27] },
  { to: '/produtos-vendidos', label: 'Produtos Vendidos', icon: 'vendidos', iconSize: [24, 14] },
  { to: '/servicos', label: 'Serviços Prestados', icon: 'servicos', iconSize: [22, 24] },
];

interface SidebarProps {
  userName: string;
  onLogout: () => void;
}

export function Sidebar({ userName, onLogout }: SidebarProps) {
  return (
    <aside className="rk-sidebar">
      <div className="rk-sidebar__user">
        <img className="rk-sidebar__logo" src={logo} alt="RK Informática e Games" />
        <span className="rk-sidebar__name">{userName}.</span>
        <button type="button" className="rk-sidebar__logout" onClick={onLogout}>
          sair
        </button>
      </div>
      <nav className="rk-sidebar__nav" aria-label="Menu principal">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className="rk-sidebar__link" title={item.label}>
            <span className="rk-sidebar__icon">
              <Icon name={item.icon} width={item.iconSize[0]} height={item.iconSize[1]} />
            </span>
            <span className="rk-sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
