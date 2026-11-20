import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocalStorage } from './lib/useLocalStorage'
import { num, ld, ymOf, shiftYm, firstDay, lastDay, seed } from './lib/utils'
import { Ic } from './components/icons.jsx'
import Header from './components/Header.jsx'
import MonthSwitcher from './components/MonthSwitcher.jsx'
import BudgetOverview from './components/BudgetOverview.jsx'
import CategoryBreakdown from './components/CategoryBreakdown.jsx'
import TransactionList from './components/TransactionList.jsx'
import AddEditSheet from './components/AddEditSheet.jsx'
import BudgetSheet from './components/BudgetSheet.jsx'
import AlertsSheet from './components/AlertsSheet.jsx'
import SettingsSheet from './components/SettingsSheet.jsx'
import { OUT } from './lib/constants'

export default function Dashboard({ onLogout }) {
  const [defBudget] = useLocalStorage('bt:budget', 15000)
  const [overrides, setOverrides] = useLocalStorage('bt:budgetOverrides', {})
  const [txs, setTxs] = useLocalStorage('bt:txs', [])

  const [sheet, setSheet] = useState(null)
  const [type, setType] = useState('out')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState('yemek')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [bud, setBud] = useState('')
  const [editId, setEditId] = useState(null)
  const [all, setAll] = useState(false)
  const [conf, setConf] = useState(false)
  const [on, setOn] = useState(false)
  const [dir, setDir] = useState('')
  const amtRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setOn(true), 120)
    return () => clearTimeout(t)
  }, [])

  const currentYm = ld(new Date()).slice(0, 7)
  const [ym, setYm] = useState(currentYm)

  const getBase = y => {
    const keys = Object.keys(overrides).filter(k => k <= y).sort()
    return keys.length ? overrides[keys[keys.length - 1]] : defBudget
  }
  const spentFor = y => txs.filter(t => t.type !== 'in' && ymOf(t.date) === y).reduce((s, t) => s + t.amount, 0)
  const incomeFor = y => txs.filter(t => t.type === 'in' && ymOf(t.date) === y).reduce((s, t) => s + t.amount, 0)

  const dataYms = useMemo(() => [...new Set([...txs.map(t => ymOf(t.date)), ...Object.keys(overrides)])].sort(), [txs, overrides])

  const { eff, carry } = useMemo(() => {
    const anchor = dataYms.length ? dataYms[0] : ym
    if (anchor > ym) return { eff: getBase(ym), carry: 0 }
    let y = anchor, c = 0, e = getBase(y)
    while (y < ym) {
      const sp = spentFor(y)
      c = e - sp
      y = shiftYm(y, 1)
      e = getBase(y) + c
    }
    return { eff: e, carry: c }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ym, txs, overrides, defBudget])

  const month = useMemo(() => txs.filter(t => ymOf(t.date) === ym).sort((a, b) => b.ts - a.ts), [txs, ym])
  const spent = spentFor(ym)
  const income = incomeFor(ym)
  const usedPct = eff > 0 ? (spent / eff) * 100 : spent > 0 ? 100 : 0
  const leftPct = Math.max(0, Math.min(100, 100 - usedPct))
  const over = spent > eff
  const warn = usedPct >= 80
  const byCat = OUT
    .map(c => ({ ...c, value: month.filter(t => t.type !== 'in' && t.cat === c.id).reduce((s, t) => s + t.amount, 0) }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)

  const isCurrent = ym === currentYm

  useEffect(() => {
    if (sheet === 'add') setTimeout(() => amtRef.current && amtRef.current.focus(), 340)
  }, [sheet])

  const goMonth = delta => {
    setDir(delta > 0 ? 'slideR' : 'slideL')
    setYm(shiftYm(ym, delta))
  }

  const openAdd = () => {
    setEditId(null)
    setType('out')
    setCat('yemek')
    setAmount('')
    setNote('')
    setDate(isCurrent ? ld(new Date()) : lastDay(ym))
    setSheet('add')
  }
  const openEdit = t => {
    setEditId(t.id)
    setType(t.type === 'in' ? 'in' : 'out')
    setCat(t.cat)
    setAmount(String(t.amount))
    setNote(t.note || '')
    setDate(t.date)
    setSheet('add')
  }
  const save = () => {
    const a = num(amount)
    if (a <= 0) return
    const dt = date || (isCurrent ? ld(new Date()) : lastDay(ym))
    const ts = dt === ld(new Date()) ? Date.now() : new Date(dt + 'T12:00:00').getTime()
    if (editId) {
      setTxs(txs.map(t => (t.id === editId ? { ...t, type, amount: a, cat, note: note.trim(), date: dt, ts: dt === t.date ? t.ts : ts } : t)))
    } else {
      setTxs([{ id: String(Date.now()), ts, date: dt, type, amount: a, cat, note: note.trim() }, ...txs])
    }
    setAmount('')
    setNote('')
    setEditId(null)
    setSheet(null)
    try { navigator.vibrate && navigator.vibrate(12) } catch {}
  }
  const del = id => setTxs(txs.filter(t => t.id !== id))
  const saveBudget = () => {
    const b = num(bud)
    if (b > 0) {
      setOverrides({ ...overrides, [ym]: b })
      setSheet(null)
    }
  }

  const editingTx = editId ? txs.find(t => t.id === editId) : null
  const dMin = editingTx ? firstDay(ymOf(editingTx.date)) : firstDay(ym)
  const dMax = editingTx ? lastDay(ymOf(editingTx.date)) : isCurrent ? ld(new Date()) : lastDay(ym)

  return (
    <div className="max-w-md mx-auto px-4 pt-3" style={{ paddingBottom: '9rem' }}>
      <Header onMenu={() => setSheet('settings')} onBell={() => setSheet('alerts')} warn={warn} />

      <MonthSwitcher
        ym={ym}
        dir={dir}
        isCurrent={isCurrent}
        onPrev={() => goMonth(-1)}
        onNext={() => !isCurrent && goMonth(1)}
        onJumpCurrent={() => { setDir('slideR'); setYm(currentYm) }}
      />

      <BudgetOverview
        ym={ym} dir={dir} leftPct={leftPct} usedPct={usedPct} over={over} warn={warn}
        carry={carry} spent={spent} eff={eff} income={income} on={on}
        onOpenBudget={() => { setBud(String(eff)); setSheet('budget') }}
      />

      <CategoryBreakdown ym={ym} dir={dir} byCat={byCat} spent={spent} on={on} isCurrent={isCurrent} onSeed={() => setTxs(seed())} />

      <TransactionList ym={ym} dir={dir} month={month} all={all} setAll={setAll} onEditTx={openEdit} />

      <nav className="fixed bottom-0 inset-x-0 z-40">
        <div className="max-w-md mx-auto rounded-t-3xl border-t backdrop-blur-xl flex flex-col items-center" style={{ background: 'var(--bar)', borderColor: 'var(--line)', paddingBottom: 'calc(.6rem + env(safe-area-inset-bottom,0px))' }}>
          <button onClick={openAdd} className="fab grad -mt-7 w-16 h-16 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform border-4" style={{ borderColor: 'var(--bg)' }} aria-label="Hızlı İşlem Ekle">
            {Ic.plus}
          </button>
          <span className="text-xs font-semibold mt-1.5">Hızlı İşlem Ekle</span>
        </div>
      </nav>

      {sheet === 'add' && (
        <AddEditSheet
          editId={editId} type={type} setType={setType} amount={amount} setAmount={setAmount}
          cat={cat} setCat={setCat} note={note} setNote={setNote} date={date} setDate={setDate}
          dMin={dMin} dMax={dMax} amtRef={amtRef} isCurrent={isCurrent} ym={ym}
          onSave={save} onDelete={() => { del(editId); setSheet(null) }} onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'budget' && (
        <BudgetSheet ym={ym} bud={bud} setBud={setBud} onSave={saveBudget} onClose={() => setSheet(null)} />
      )}

      {sheet === 'alerts' && (
        <AlertsSheet ym={ym} over={over} warn={warn} spent={spent} eff={eff} usedPct={usedPct} leftPct={leftPct} onClose={() => setSheet(null)} />
      )}

      {sheet === 'settings' && (
        <SettingsSheet
          ym={ym} eff={eff}
          onOpenBudget={() => { setBud(String(eff)); setSheet('budget') }}
          onSeed={() => { setTxs(seed()); setSheet(null) }}
          conf={conf} setConf={setConf}
          onReset={() => { setTxs([]); setOverrides({}); setConf(false); setSheet(null) }}
          onClose={() => { setSheet(null); setConf(false) }}
          onLogout={onLogout}
        />
      )}
    </div>
  )
}
