import { Ic } from './icons.jsx'
import { monthLabel } from '../lib/utils'

export default function MonthSwitcher({ ym, dir, isCurrent, onPrev, onNext, onJumpCurrent }) {
  return (
    <div className="flex items-center justify-between rounded-2xl p-1.5 mb-3" style={{ background: 'var(--card2)' }}>
      <button onClick={onPrev} className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition" style={{ color: 'var(--text)' }} aria-label="Önceki ay">
        {Ic.chevL}
      </button>
      <div className="flex items-center gap-2">
        <span key={ym} className={dir + ' font-bold text-[15px]'}>{monthLabel(ym)}</span>
        {!isCurrent && (
          <button onClick={onJumpCurrent} className="text-[11px] font-bold px-2 h-7 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            Bu ay
          </button>
        )}
      </div>
      <button onClick={onNext} disabled={isCurrent} className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition disabled:opacity-25" style={{ color: 'var(--text)' }} aria-label="Sonraki ay">
        {Ic.chevR}
      </button>
    </div>
  )
}
