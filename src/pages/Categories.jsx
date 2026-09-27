import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { subscribeCategories, addCategory, deleteCategory, seedDefaultCategories } from '../lib/data.js'

const COLORS = ['#c9a24b', '#83b596', '#7d9bc9', '#c97a7f', '#a888c9', '#d9a441', '#8a8a8a']

export default function Categories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('expense')
  const [color, setColor] = useState(COLORS[0])
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    if (!user) return
    return subscribeCategories(user.uid, (cats) => { setCategories(cats); setLoaded(true) })
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await addCategory(user.uid, { name: name.trim(), type, color })
    setName('')
  }

  const handleSeed = async () => {
    setSeeding(true)
    await seedDefaultCategories(user.uid)
    setSeeding(false)
  }

  const expenseCats = categories.filter(c => c.type === 'expense')
  const incomeCats = categories.filter(c => c.type === 'income')

  return (
    <div>
      <div className="page-header">
        <h2>Categorías</h2>
      </div>

      <form className="panel" onSubmit={handleSubmit}>
        <div className="type-toggle" style={{ marginBottom: '0.9rem', maxWidth: 260 }}>
          <button type="button" className={type === 'expense' ? 'active expense' : ''} onClick={() => setType('expense')}>Gasto</button>
          <button type="button" className={type === 'income' ? 'active income' : ''} onClick={() => setType('income')}>Ingreso</button>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Mascotas" required />
          </div>
          <div className="field">
            <label>Color</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', background: c,
                    border: color === c ? '2px solid var(--ink)' : '2px solid transparent',
                    padding: 0,
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <button className="btn-primary" type="submit">Agregar categoría</button>
        </div>
      </form>

      {loaded && categories.length === 0 && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-dim)', marginTop: 0 }}>
            Todavía no tenés categorías propias. Podés arrancar con un set básico y editarlo después.
          </p>
          <button className="btn-ghost" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Cargando…' : 'Cargar categorías por defecto'}
          </button>
        </div>
      )}

      {expenseCats.length > 0 && (
        <>
          <h3 style={{ margin: '1.5rem 0 0.6rem', fontSize: '1rem' }}>Gastos</h3>
          <div className="ledger">
            {expenseCats.map((c) => (
              <div key={c.id} className="ledger-row" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                <span className="dot" style={{ background: c.color }} />
                <span>{c.name}</span>
                <button className="del" onClick={() => deleteCategory(user.uid, c.id)}>Borrar</button>
              </div>
            ))}
          </div>
        </>
      )}

      {incomeCats.length > 0 && (
        <>
          <h3 style={{ margin: '1.5rem 0 0.6rem', fontSize: '1rem' }}>Ingresos</h3>
          <div className="ledger">
            {incomeCats.map((c) => (
              <div key={c.id} className="ledger-row" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                <span className="dot" style={{ background: c.color }} />
                <span>{c.name}</span>
                <button className="del" onClick={() => deleteCategory(user.uid, c.id)}>Borrar</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
