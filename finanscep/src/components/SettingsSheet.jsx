import Sheet from './Sheet.jsx'
import { tl, monthLabel } from '../lib/utils'

export default function SettingsSheet({ ym, eff, onOpenBudget, onSeed, conf, setConf, onReset, onClose }) {
  return (
    <Sheet title="Ayarlar" onClose={onClose}>
      <button onClick={onOpenBudget} className="w-full h-14 rounded-2xl px-4 flex items-center justify-between mb-2 active:scale-[.98] transition" style={{ background: 'var(--card2)' }}>
        <span className="font-semibold">{monthLabel(ym)} bütçesi</span>
        <span className="muted">{tl(eff)} ›</span>
      </button>
      <button onClick={onSeed} className="w-full h-14 rounded-2xl px-4 text-left font-semibold mb-2 active:scale-[.98] transition" style={{ background: 'var(--card2)', color: 'var(--accent)' }}>
        Örnek veri yükle (2 ay)
      </button>
      <button
        onClick={() => (conf ? onReset() : setConf(true))}
        className="w-full h-14 rounded-2xl px-4 text-left font-semibold active:scale-[.98] transition"
        style={{ background: conf ? '#ef4444' : 'var(--card2)', color: conf ? '#fff' : 'var(--red)' }}
      >
        {conf ? 'Emin misin? Tekrar dokun' : 'Tüm verileri sıfırla'}
      </button>
    </Sheet>
  )
}
