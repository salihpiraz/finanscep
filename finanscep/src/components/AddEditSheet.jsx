import Sheet from './Sheet.jsx'
import { Ic } from './icons.jsx'
import { OUT, INC } from '../lib/constants'
import { num, monthLabel } from '../lib/utils'

export default function AddEditSheet({
  editId, type, setType, amount, setAmount, cat, setCat, note, setNote,
  date, setDate, dMin, dMax, amtRef, isCurrent, ym, onSave, onDelete, onClose
}) {
  const cats = type === 'in' ? INC : OUT
  const pickType = t => {
    setType(t)
    setCat(t === 'in' ? 'maas' : 'yemek')
  }
  const title = editId ? 'İşlemi düzenle' : isCurrent ? 'Yeni işlem' : monthLabel(ym) + ' için işlem'

  return (
    <Sheet title={title} onClose={onClose}>
      <div className="grid grid-cols-2 p-1 rounded-2xl mb-3" style={{ background: 'var(--card2)' }}>
        {[['out', 'Gider'], ['in', 'Gelir']].map(([k, l]) => (
          <button key={k} onClick={() => pickType(k)} className="h-11 rounded-xl text-sm font-bold transition" style={type === k ? { background: k === 'in' ? 'var(--green)' : 'var(--accent)', color: '#fff' } : { color: 'var(--muted)' }}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-4 h-20" style={{ background: 'var(--card2)' }}>
        <span className="text-3xl font-bold muted">₺</span>
        <input
          ref={amtRef}
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
          inputMode="decimal"
          placeholder="0"
          className="flex-1 min-w-0 h-full bg-transparent outline-none text-4xl font-extrabold"
          style={{ color: 'var(--text)' }}
        />
      </div>

      <div className="flex gap-2 mt-2">
        {[50, 100, 250, 500].map(v => (
          <button key={v} onClick={() => setAmount(String(num(amount) + v))} className="flex-1 h-10 rounded-xl text-sm font-semibold active:scale-95 transition" style={{ background: 'var(--card2)', color: 'var(--accent)' }}>
            +{v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 mt-3">
        {cats.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} className="h-[68px] rounded-2xl flex flex-col items-center justify-center text-[11px] font-semibold active:scale-95 transition" style={{ background: cat === c.id ? c.color + '33' : 'var(--card2)', outline: cat === c.id ? '2px solid ' + c.color : 'none' }}>
            <span className="text-xl">{c.icon}</span>{c.name}
          </button>
        ))}
      </div>

      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Açıklama (isteğe bağlı)" maxLength={40} className="mt-3 w-full h-12 rounded-2xl px-4 outline-none" style={{ background: 'var(--card2)', color: 'var(--text)' }} />
      <input type="date" value={date} min={dMin} max={dMax} onChange={e => setDate(e.target.value)} className="mt-2 w-full h-12 rounded-2xl px-4 outline-none" style={{ background: 'var(--card2)', color: 'var(--text)' }} />

      <button onClick={onSave} disabled={num(amount) <= 0} className="grad mt-3 w-full h-14 rounded-2xl text-white font-bold text-lg disabled:opacity-40 active:scale-95 transition">
        {editId ? 'Güncelle' : 'Kaydet'}
      </button>
      {editId && (
        <button onClick={onDelete} className="mt-2 w-full h-12 rounded-2xl font-semibold flex items-center justify-center gap-2 bg-red-500 text-white active:scale-95 transition">
          {Ic.trash} Sil
        </button>
      )}
    </Sheet>
  )
}
