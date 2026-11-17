import { OUT, INC } from './constants'

export const catOf = id => [...OUT, ...INC].find(c => c.id === id) || OUT[7]
export const tl = n => Math.round(n).toLocaleString('tr-TR') + ' TL'
export const num = s => parseFloat(String(s).replace(',', '.')) || 0
export const ld = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
export const ymOf = dateStr => dateStr.slice(0, 7)

export const shiftYm = (ym, delta) => {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

export const monthLabel = ym => {
  const [y, m] = ym.split('-').map(Number)
  const s = new Date(y, m - 1, 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const firstDay = ym => ym + '-01'
export const lastDay = ym => {
  const [y, m] = ym.split('-').map(Number)
  return ym + '-' + String(new Date(y, m, 0).getDate()).padStart(2, '0')
}

export const dayLabel = ts => {
  const d = new Date(ts), n = new Date()
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const b = new Date(n.getFullYear(), n.getMonth(), n.getDate())
  const diff = Math.round((b - a) / 864e5)
  if (diff === 0) return 'Bugün'
  if (diff === 1) return 'Dün'
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
}

export const seed = () => {
  const n = new Date(), y = n.getFullYear(), m = n.getMonth(), td = n.getDate()
  const mk = (k, type, amount, cat, note, monthOff = 0) => {
    const dd = new Date(y, m - monthOff, Math.max(1, td - k), 12, 0, k)
    return { id: 's' + monthOff + k + cat + amount, ts: dd.getTime(), date: ld(dd), type, amount, cat, note }
  }
  return [
    mk(0, 'out', 95, 'yemek', 'Starbucks'), mk(0, 'out', 15, 'ulasim', 'Metro'),
    mk(1, 'out', 320, 'market', 'Market Alışverişi'), mk(2, 'out', 1200, 'fatura', 'Kira Ödemesi'),
    mk(3, 'out', 180, 'eglence', 'Sinema'), mk(3, 'out', 240, 'yemek', 'Akşam Yemeği'),
    mk(4, 'out', 450, 'ulasim', 'Akbil Yükleme'), mk(5, 'out', 900, 'alisveris', 'Giyim'),
    mk(td, 'in', 8250, 'maas', 'Maaş'),
    mk(2, 'out', 1100, 'fatura', 'Kira Ödemesi', 1), mk(6, 'out', 380, 'market', 'Market', 1),
    mk(10, 'out', 260, 'eglence', 'Konser', 1), mk(td, 'in', 8000, 'maas', 'Maaş', 1)
  ].sort((a, b) => b.ts - a.ts)
}
