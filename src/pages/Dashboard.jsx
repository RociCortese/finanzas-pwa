import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { subscribeAccounts, subscribeTransactions } from '../lib/data.js'

function formatMoney(n, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(n || 0)
}

export default function Dashboard() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    if (!user) return
    const u1 = subscribeAccounts(user.uid, setAccounts)
    const u2 = subscribeTransactions(user.uid, setTransactions)
    return () => { u1(); u2() }
  }, [user])

  const mainCurrency = accounts[0]?.currency || 'ARS'
  const totalBalance = accounts
    .filter(a => (a.currency || 'ARS') === mainCurrency)
    .reduce((sum, a) => sum + (a.balance || 0), 0)

  const thisMonth = useMemo(() => {
    const now = new Date()
    const ym = now.toISOString().slice(0, 7)
    return transactions.filter(t => (t.date || '').startsWith(ym))
  }, [transactions])

  const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const byCategory = useMemo(() => {
    const map = {}
    thisMonth.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [thisMonth])

  const recent = transactions.slice(0, 6)

  return (
    <div>
      <div className="page-header">
        <h2>Resumen</h2>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="label">Saldo total</div>
          <div className="value">{formatMoney(totalBalance, mainCurrency)}</div>
        </div>
        <div className="stat">
          <div className="label">Ingresos del mes</div>
          <div className="value" style={{ color: 'var(--positive)' }}>{formatMoney(income, mainCurrency)}</div>
        </div>
        <div className="stat">
          <div className="label">Gastos del mes</div>
          <div className="value" style={{ color: 'var(--negative)' }}>{formatMoney(expense, mainCurrency)}</div>
        </div>
      </div>

      {byCategory.length > 0 && (
        <>
          <h3 style={{ marginBottom: '0.8rem', fontSize: '1rem' }}>Gastos por categoría este mes</h3>
          <div className="ledger" style={{ marginBottom: '2rem' }}>
            {byCategory.map(([cat, amt]) => (
              <div key={cat} className="ledger-row" style={{ gridTemplateColumns: '1fr auto' }}>
                <span>{cat}</span>
                <span className="amount mono expense">{formatMoney(amt, mainCurrency)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 style={{ marginBottom: '0.8rem', fontSize: '1rem' }}>Últimos movimientos</h3>
      <div className="ledger">
        {recent.length === 0 && <div className="ledger-empty">Todavía no hay movimientos registrados.</div>}
        {recent.map((tx) => (
          <div key={tx.id} className="ledger-row" style={{ gridTemplateColumns: '1fr auto' }}>
            <span>{tx.category}{tx.note ? ` · ${tx.note}` : ''} <span style={{ color: 'var(--ink-dim)', fontSize: '0.8rem' }}>{tx.date}</span></span>
            <span className={`amount mono ${tx.type}`}>{tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount, mainCurrency)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
