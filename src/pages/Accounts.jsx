import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { subscribeAccounts, addAccount, deleteAccount } from '../lib/data.js'

const COLORS = ['#c9a24b', '#83b596', '#7d9bc9', '#c97a7f', '#a888c9']

function formatMoney(n, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(n || 0)
}

export default function Accounts() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [name, setName] = useState('')
  const [type, setType] = useState('efectivo')
  const [balance, setBalance] = useState('')
  const [currency, setCurrency] = useState('ARS')

  useEffect(() => {
    if (!user) return
    return subscribeAccounts(user.uid, setAccounts)
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const color = COLORS[accounts.length % COLORS.length]
    await addAccount(user.uid, { name: name.trim(), type, balance, currency, color })
    setName(''); setBalance('')
  }

  return (
    <div>
      <div className="page-header">
        <h2>Cuentas</h2>
      </div>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Banco Galicia" required />
        </div>
        <div className="field">
          <label>Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="banco">Cuenta bancaria</option>
            <option value="tarjeta">Tarjeta de crédito</option>
            <option value="ahorro">Ahorro / inversión</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div className="field">
          <label>Saldo inicial</label>
          <input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0" />
        </div>
        <div className="field">
          <label>Moneda</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <button className="btn-primary" type="submit">Agregar cuenta</button>
      </form>

      <div className="ledger">
        {accounts.length === 0 && <div className="ledger-empty">Todavía no agregaste ninguna cuenta.</div>}
        {accounts.map((a) => (
          <div key={a.id} className="ledger-row">
            <span className="dot" style={{ background: a.color }} />
            <div>
              <div>{a.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-dim)' }}>{a.type}</div>
            </div>
            <span className="amount mono">{formatMoney(a.balance, a.currency)}</span>
            <button className="del" onClick={() => deleteAccount(user.uid, a.id)}>Borrar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
