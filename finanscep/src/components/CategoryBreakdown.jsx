import { tl } from '../lib/utils'
import { useCountUp } from '../lib/useCountUp'

export default function CategoryBreakdown({ ym, dir, byCat, spent, on, isCurrent, onSeed }) {
  const cSpent = useCountUp(spent)
  let acc = 0

  return (
    <section key={ym + 'cat'} className={'card item p-4 mt-3 ' + dir} style={{ animationDelay: '.06s' }}>
      <h2 className="text-sm font-semibold mb-3">Harcama Dağılımı</h2>
      {byCat.length === 0 ? (
        <div className="text-center py-6 muted text-sm">
          <div className="text-4xl mb-2">📊</div>
          Bu ay için harcama yok.
          {isCurrent && (
            <div>
              <button onClick={onSeed} className="mt-3 px-4 h-10 rounded-full text-sm font-semibold active:scale-95 transition" style={{ background: 'var(--card2)', color: 'var(--accent)' }}>
                Örnek veri yükle
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative w-36 h-36 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9155" fill="none" strokeWidth="5" style={{ stroke: 'var(--card2)' }} />
              {byCat.map(c => {
                const p = (c.value / spent) * 100
                const off = -acc
                acc += p
                const w = on ? Math.max(p - 0.8, 0) : 0
                return (
                  <circle key={c.id} className="seg" cx="18" cy="18" r="15.9155" fill="none" strokeWidth="5" stroke={c.color} strokeDasharray={`${w} ${100 - w}`} strokeDashoffset={off} />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] muted">Harcama</span>
              <span className="text-sm font-extrabold">{tl(cSpent)}</span>
            </div>
          </div>
          <ul className="flex-1 space-y-1.5 min-w-0">
            {byCat.slice(0, 6).map(c => (
              <li key={c.id} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="muted font-semibold">%{Math.round((c.value / spent) * 100)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
