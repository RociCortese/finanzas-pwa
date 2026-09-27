import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Accounts from './pages/Accounts.jsx'
import Categories from './pages/Categories.jsx'
import Budgets from './pages/Budgets.jsx'

function Private({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="screen-center">Cargando…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Private>
            <Layout />
          </Private>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transacciones" element={<Transactions />} />
        <Route path="cuentas" element={<Accounts />} />
        <Route path="categorias" element={<Categories />} />
        <Route path="metas" element={<Budgets />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
