import { tl } from '../lib/utils'
import { useCountUp } from '../lib/useCountUp'

export default function BudgetOverview({ ym, dir, leftPct, usedPct, over, warn, carry, spent, eff, income, on, onOpenBudget }) {
  const ringColor = over ? 'var(--red)' : warn ? 'var(--amber)' : 'url(#g)'
  const cPct = useCountUp(leftPct)
  const cSpent = useCountUp(spent)
  const cEff = useCountUp(eff)
  const cInc = useCountUp(income)

  return (
    <section key={ym + 'ov'} className={'card item p-4 ' + dir}>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#14b8a6" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle cx="18" cy="18" r="15.9155" fill="none" strokeWidth="3.6" style={{ stroke: 'var(--card2)' }} />
            <circle className="seg" cx="18" cy="18" r="15.9155" fill="none" strokeWidth="3.6" strokeLinecap="round" style={{ stroke: ringColor }} strokeDasharray={`${on ? leftPct : 0} 100`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-extrabold">%{Math.round(cPct)}</div>
        </div>
        <div className="flex-1 min-w-0">
          <button onClick={onOpenBudget} className="w-full text-left active:opacity-70">
            <div className="font-semibold text-[15px]">
              {over ? 'Bütçe aşıldı' : 'Kalan Bütçe: %' + Math.round(leftPct)} <span className="muted text-xs">✎</span>
            </div>
          </button>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card2)' }}>
            <div className="bar h-full rounded-full" style={{ width: (on ? Math.min(usedPct, 100) : 0) + '%', background: over ? 'var(--red)' : warn ? 'var(--amber)' : 'var(--accent)' }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px]">
            <span className="muted">{tl(cSpent)} / {tl(cEff)}</span>
            <span style={{ color: 'var(--green)' }} className="font-semibold">Gelir: {tl(cInc)}</span>
          </div>
          {Math.round(carry) !== 0 && (
            <div className="mt-1.5 text-[11px] font-semibold flex items-center gap-1" style={{ color: carry >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {carry >= 0 ? '↳ Önceki aydan devir: +' + tl(carry) : '↳ Önceki ay aşımı: -' + tl(-carry)}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
