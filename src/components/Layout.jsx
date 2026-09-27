import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const links = [
  { to: '/', label: 'Resumen', end: true, icon: '◧' },
  { to: '/transacciones', label: 'Movimientos', icon: '≡' },
  { to: '/cuentas', label: 'Cuentas', icon: '▤' },
  { to: '/categorias', label: 'Categorías', icon: '◈' },
  { to: '/metas', label: 'Metas', icon: '◎' },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Finanzas<span>.</span></div>
        <nav className="nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {user?.photoURL && <img src={user.photoURL} alt="" />}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ color: 'var(--ink)', fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.displayName || user?.email}
            </div>
            <button className="logout-btn" onClick={logout}>Cerrar sesión</button>
          </div>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
