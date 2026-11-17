import { tl, dayLabel, catOf } from '../lib/utils'

export default function TransactionList({ ym, dir, month, all, setAll, onEditTx }) {
  const list = all ? month : month.slice(0, 5)

  return (
    <section key={ym + 'tx'} className={'card item p-4 mt-3 ' + dir} style={{ animationDelay: '.12s' }}>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-sm font-semibold">İşlemler</h2>
          <p className="text-[11px] muted">Düzenlemek için bir işleme dokun</p>
        </div>
        {month.length > 5 && (
          <button onClick={() => setAll(!all)} className="text-xs font-semibold h-9 px-2 -mr-2" style={{ color: 'var(--accent)' }}>
            {all ? 'Daha az' : 'Tümünü gör'}
          </button>
        )}
      </div>
      {month.length === 0 ? (
        <div className="muted text-sm py-4 text-center">Bu ayda işlem bulunmuyor.</div>
      ) : (
        <ul>
          {list.map((t, i) => {
            const c = catOf(t.cat)
            const isIn = t.type === 'in'
            return (
              <li
                key={t.id}
                onClick={() => onEditTx(t)}
                className="item flex items-center gap-3 py-2.5 border-b last:border-0 cursor-pointer active:opacity-70 transition"
                style={{ borderColor: 'var(--line)', animationDelay: i * 0.04 + 's' }}
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: c.color + '2b' }}>{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{t.note || c.name}</div>
                  <div className="text-xs muted">{c.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: isIn ? 'var(--green)' : 'var(--red)' }}>{isIn ? '+' : '-'}{tl(t.amount)}</div>
                  <div className="text-[11px] muted">{dayLabel(t.ts)}</div>
                </div>
                <span className="muted text-lg -mr-1">›</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
