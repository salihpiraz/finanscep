import Sheet from './Sheet.jsx'
import { tl, monthLabel } from '../lib/utils'

export default function AlertsSheet({ ym, over, warn, spent, eff, usedPct, leftPct, onClose }) {
  const message = over
    ? '⚠️ ' + monthLabel(ym) + ' bütçeni ' + tl(spent - eff) + ' aştın.'
    : warn
    ? '⚠️ Bütçenin %' + Math.round(usedPct) + '’ini kullandın, dikkatli ol.'
    : '✅ Harcamaların kontrol altında. Bütçenin %' + Math.round(leftPct) + '’i hâlâ duruyor.'

  return (
    <Sheet title="Bildirimler" onClose={onClose}>
      <div className="rounded-2xl p-4 text-sm" style={{ background: 'var(--card2)' }}>{message}</div>
    </Sheet>
  )
}
