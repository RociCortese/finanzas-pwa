import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { subscribeAccounts, subscribeTransactions, subscribeCategories, addTransaction, deleteTransaction } from '../lib/data.js'

function formatMoney(n, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(n || 0)
}
function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function Transactions() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])

  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    const u1 = subscribeAccounts(user.uid, (accs) => {
      setAccounts(accs)
      setAccountId((cur) => cur || accs[0]?.id || '')
    })
    const u2 = subscribeTransactions(user.uid, setTransactions)
    const u3 = subscribeCategories(user.uid, setCategories)
    return () => { u1(); u2(); u3() }
  }, [user])

  const accountsById = useMemo(() => Object.fromEntries(accounts.map(a => [a.id, a])), [accounts])
  const categoriesByType = useMemo(() => ({
    expense: categories.filter(c => c.type === 'expense'),
    income: categories.filter(c => c.type === 'income'),
  }), [categories])

  useEffect(() => {
    const list = categoriesByType[type]
    if (list.length && !list.some(c => c.name === category)) {
      setCategory(list[0].name)
    }
  }, [categoriesByType, type])

  const handleTypeChange = (t) => setType(t)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!accountId) { setError('Agregá una cuenta primero, en la sección Cuentas.'); return }
    if (!category) { setError('Agregá una categoría primero, en la sección Categorías.'); return }
    if (!amount || Number(amount) <= 0) { setError('Ingresá un monto válido.'); return }
    await addTransaction(user.uid, {
      type, amount: Number(amount), category, accountId, date, note: note.trim(),
    })
    setAmount(''); setNote('')
  }

  return (
    <div>
      <div className="page-header">
        <h2>Movimientos</h2>
      </div>

      <form className="panel" onSubmit={handleSubmit}>
        <div className="type-toggle" style={{ marginBottom: '0.9rem', maxWidth: 260 }}>
          <button type="button" className={type === 'expense' ? 'active expense' : ''} onClick={() => handleTypeChange('expense')}>Gasto</button>
          <button type="button" className={type === 'income' ? 'active income' : ''} onClick={() => handleTypeChange('income')}>Ingreso</button>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Monto</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" required />
          </div>
          <div className="field">
            <label>Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={categoriesByType[type].length === 0}>
              {categoriesByType[type].length === 0 && <option value="">Sin categorías</option>}
              {categoriesByType[type].map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Cuenta</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Nota (opcional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Detalle" />
          </div>
          <button className="btn-primary" type="submit">Guardar</button>
        </div>
        {error && <p style={{ color: 'var(--negative)', marginTop: '0.6rem', marginBottom: 0 }}>{error}</p>}
      </form>

      <div className="ledger">
        {transactions.length === 0 && <div className="ledger-empty">Todavía no registraste ningún movimiento.</div>}
        {transactions.map((tx) => (
          <div key={tx.id} className="ledger-row">
            <span className="dot" style={{ background: accountsById[tx.accountId]?.color || '#666' }} />
            <div>
              <div>{tx.category}{tx.note ? ` · ${tx.note}` : ''}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-dim)' }}>
                {tx.date} · {accountsById[tx.accountId]?.name || 'Cuenta eliminada'}
              </div>
            </div>
            <span className={`amount mono ${tx.type}`}>
              {tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount, accountsById[tx.accountId]?.currency)}
            </span>
            <button className="del" onClick={() => deleteTransaction(user.uid, tx)}>Borrar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
