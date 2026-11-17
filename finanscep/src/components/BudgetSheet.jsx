import Sheet from './Sheet.jsx'
import { monthLabel } from '../lib/utils'

export default function BudgetSheet({ ym, bud, setBud, onSave, onClose }) {
  return (
    <Sheet title={monthLabel(ym) + ' bütçesi'} onClose={onClose}>
      <p className="text-xs muted mb-3">Bu değişiklik {monthLabel(ym)} ve sonrasındaki aylara uygulanır. Geçmiş aylar etkilenmez.</p>
      <div className="flex items-center gap-2 rounded-2xl px-4 h-20" style={{ background: 'var(--card2)' }}>
        <span className="text-3xl font-bold muted">₺</span>
        <input
          value={bud}
          onChange={e => setBud(e.target.value.replace(/[^0-9.,]/g, ''))}
          inputMode="decimal"
          className="flex-1 min-w-0 h-full bg-transparent outline-none text-4xl font-extrabold"
          style={{ color: 'var(--text)' }}
        />
      </div>
      <button onClick={onSave} className="grad mt-4 w-full h-14 rounded-2xl text-white font-bold text-lg active:scale-95 transition">Güncelle</button>
    </Sheet>
  )
}
