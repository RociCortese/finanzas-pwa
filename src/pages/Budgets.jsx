import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  subscribeBudgets, addBudget, deleteBudget,
  subscribeGoals, addGoal, updateGoal, deleteGoal,
  subscribeTransactions,
} from '../lib/data.js'

function formatMoney(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n || 0)
}

function BudgetsSection({ uid }) {
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')

  useEffect(() => {
    const u1 = subscribeBudgets(uid, setBudgets)
    const u2 = subscribeTransactions(uid, setTransactions)
    return () => { u1(); u2() }
  }, [uid])

  const spentByCategory = useMemo(() => {
    const now = new Date().toISOString().slice(0, 7)
    const map = {}
    transactions
      .filter(t => t.type === 'expense' && (t.date || '').startsWith(now))
      .forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
    return map
  }, [transactions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!category.trim() || !limit) return
    await addBudget(uid, { category: category.trim(), monthlyLimit: limit })
    setCategory(''); setLimit('')
  }

  return (
    <>
      <h3 style={{ marginBottom: '0.9rem', fontSize: '1.05rem' }}>Presupuestos por categoría (este mes)</h3>
      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Categoría</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej: Comida" required />
        </div>
        <div className="field">
          <label>Límite mensual</label>
          <input type="number" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="0" required />
        </div>
        <button className="btn-primary" type="submit">Agregar presupuesto</button>
      </form>

      {budgets.length === 0 && <div className="ledger-empty">Todavía no definiste presupuestos.</div>}
      {budgets.map((b) => {
        const spent = spentByCategory[b.category] || 0
        const pct = Math.min(100, (spent / (b.monthlyLimit || 1)) * 100)
        const over = spent > b.monthlyLimit
        return (
          <div key={b.id} className="goal-card">
            <div className="top">
              <div>
                <strong>{b.category}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-dim)' }}>
                  {formatMoney(spent)} de {formatMoney(b.monthlyLimit)}
                </div>
              </div>
              <button className="del" onClick={() => deleteBudget(uid, b.id)}>Borrar</button>
            </div>
            <div className="bar-track"><div className={`bar-fill ${over ? 'over' : ''}`} style={{ width: pct + '%' }} /></div>
          </div>
        )
      })}
    </>
  )
}

function GoalsSection({ uid }) {
  const [goals, setGoals] = useState([])
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')

  useEffect(() => subscribeGoals(uid, setGoals), [uid])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !target) return
    await addGoal(uid, { name: name.trim(), targetAmount: target, savedAmount: 0 })
    setName(''); setTarget('')
  }

  const addSaved = (goal, delta) => {
    const next = Math.max(0, (goal.savedAmount || 0) + delta)
    updateGoal(uid, goal.id, { savedAmount: next })
  }

  return (
    <>
      <h3 style={{ margin: '2rem 0 0.9rem', fontSize: '1.05rem' }}>Metas de ahorro</h3>
      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Nombre de la meta</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Vacaciones" required />
        </div>
        <div className="field">
          <label>Objetivo</label>
          <input type="number" step="0.01" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0" required />
        </div>
        <button className="btn-primary" type="submit">Agregar meta</button>
      </form>

      {goals.length === 0 && <div className="ledger-empty">Todavía no creaste ninguna meta.</div>}
      {goals.map((g) => {
        const pct = Math.min(100, ((g.savedAmount || 0) / (g.targetAmount || 1)) * 100)
        return (
          <div key={g.id} className="goal-card">
            <div className="top">
              <div>
                <strong>{g.name}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-dim)' }}>
                  {formatMoney(g.savedAmount)} de {formatMoney(g.targetAmount)}
                </div>
              </div>
              <button className="del" onClick={() => deleteGoal(uid, g.id)}>Borrar</button>
            </div>
            <div className="bar-track"><div className="bar-fill" style={{ width: pct + '%' }} /></div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem' }}>
              <button className="btn-ghost" onClick={() => addSaved(g, 1000)}>+ $1.000</button>
              <button className="btn-ghost" onClick={() => addSaved(g, -1000)}>- $1.000</button>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default function Budgets() {
  const { user } = useAuth()
  return (
    <div>
      <div className="page-header">
        <h2>Metas</h2>
      </div>
      <BudgetsSection uid={user.uid} />
      <GoalsSection uid={user.uid} />
    </div>
  )
}
