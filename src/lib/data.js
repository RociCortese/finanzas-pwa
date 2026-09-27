import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, runTransaction
} from 'firebase/firestore'
import { db } from './firebase'

// Modelo de datos en Firestore, todo debajo de users/{uid} para que
// cada usuario vea solo lo suyo (ver firestore.rules):
//
// users/{uid}/accounts/{accountId}   -> { name, type, currency, balance, color, createdAt }
// users/{uid}/transactions/{txId}    -> { type: 'income'|'expense', amount, category,
//                                          accountId, note, date, createdAt }
// users/{uid}/budgets/{budgetId}     -> { category, monthlyLimit, month }  (presupuesto por categoría/mes)
// users/{uid}/goals/{goalId}         -> { name, targetAmount, savedAmount, dueDate, color }

const col = (uid, name) => collection(db, 'users', uid, name)
const ref = (uid, name, id) => doc(db, 'users', uid, name, id)

// ---------- Cuentas ----------
export function subscribeAccounts(uid, cb) {
  const q = query(col(uid, 'accounts'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function addAccount(uid, data) {
  return addDoc(col(uid, 'accounts'), { ...data, balance: Number(data.balance) || 0, createdAt: serverTimestamp() })
}

export function updateAccount(uid, id, data) {
  return updateDoc(ref(uid, 'accounts', id), data)
}

export function deleteAccount(uid, id) {
  return deleteDoc(ref(uid, 'accounts', id))
}

// ---------- Transacciones ----------
export function subscribeTransactions(uid, cb) {
  const q = query(col(uid, 'transactions'), orderBy('date', 'desc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

// Crea la transacción y ajusta el saldo de la cuenta en una sola operación atómica.
export async function addTransaction(uid, tx) {
  const accountRef = ref(uid, 'accounts', tx.accountId)
  const txRef = doc(col(uid, 'transactions'))
  const signedAmount = tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount)

  await runTransaction(db, async (t) => {
    const accSnap = await t.get(accountRef)
    if (!accSnap.exists()) throw new Error('La cuenta ya no existe')
    const newBalance = (accSnap.data().balance || 0) + signedAmount
    t.set(txRef, { ...tx, amount: Math.abs(tx.amount), createdAt: serverTimestamp() })
    t.update(accountRef, { balance: newBalance })
  })
}

export async function deleteTransaction(uid, tx) {
  const accountRef = ref(uid, 'accounts', tx.accountId)
  const txRef = ref(uid, 'transactions', tx.id)
  const signedAmount = tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount)

  await runTransaction(db, async (t) => {
    const accSnap = await t.get(accountRef)
    t.delete(txRef)
    if (accSnap.exists()) {
      const newBalance = (accSnap.data().balance || 0) - signedAmount
      t.update(accountRef, { balance: newBalance })
    }
  })
}

// ---------- Presupuestos ----------
export function subscribeBudgets(uid, cb) {
  const q = query(col(uid, 'budgets'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function addBudget(uid, data) {
  return addDoc(col(uid, 'budgets'), { ...data, monthlyLimit: Number(data.monthlyLimit) || 0, createdAt: serverTimestamp() })
}

export function updateBudget(uid, id, data) {
  return updateDoc(ref(uid, 'budgets', id), data)
}

export function deleteBudget(uid, id) {
  return deleteDoc(ref(uid, 'budgets', id))
}

// ---------- Categorías ----------
export function subscribeCategories(uid, cb) {
  const q = query(col(uid, 'categories'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function addCategory(uid, data) {
  return addDoc(col(uid, 'categories'), { ...data, createdAt: serverTimestamp() })
}

export function updateCategory(uid, id, data) {
  return updateDoc(ref(uid, 'categories', id), data)
}

export function deleteCategory(uid, id) {
  return deleteDoc(ref(uid, 'categories', id))
}

const DEFAULT_CATEGORIES = [
  { name: 'Comida', type: 'expense', color: '#c97a7f' },
  { name: 'Transporte', type: 'expense', color: '#7d9bc9' },
  { name: 'Vivienda', type: 'expense', color: '#c9a24b' },
  { name: 'Servicios', type: 'expense', color: '#a888c9' },
  { name: 'Salud', type: 'expense', color: '#83b596' },
  { name: 'Ocio', type: 'expense', color: '#d9a441' },
  { name: 'Otro', type: 'expense', color: '#8a8a8a' },
  { name: 'Sueldo', type: 'income', color: '#83b596' },
  { name: 'Venta', type: 'income', color: '#7d9bc9' },
  { name: 'Regalo', type: 'income', color: '#c9a24b' },
  { name: 'Otro', type: 'income', color: '#8a8a8a' },
]

export async function seedDefaultCategories(uid) {
  await Promise.all(DEFAULT_CATEGORIES.map((c) => addCategory(uid, c)))
}

// ---------- Metas de ahorro ----------
export function subscribeGoals(uid, cb) {
  const q = query(col(uid, 'goals'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function addGoal(uid, data) {
  return addDoc(col(uid, 'goals'), {
    ...data,
    targetAmount: Number(data.targetAmount) || 0,
    savedAmount: Number(data.savedAmount) || 0,
    createdAt: serverTimestamp(),
  })
}

export function updateGoal(uid, id, data) {
  return updateDoc(ref(uid, 'goals', id), data)
}

export function deleteGoal(uid, id) {
  return deleteDoc(ref(uid, 'goals', id))
}
