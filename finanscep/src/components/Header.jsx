import { Ic } from './icons.jsx'

export default function Header({ onMenu, onBell, warn }) {
  return (
    <header className="flex items-center justify-between h-12 mb-1">
      <button onClick={onMenu} className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full active:scale-90 transition muted" aria-label="Menü">
        {Ic.menu}
      </button>
      <div className="text-xl font-extrabold tracking-tight">
        Finans<span style={{ color: 'var(--accent)' }}>Cep</span>
      </div>
      <button onClick={onBell} className="relative w-11 h-11 -mr-2 flex items-center justify-center rounded-full active:scale-90 transition muted" aria-label="Bildirimler">
        {Ic.bell}
        {warn && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2" style={{ borderColor: 'var(--bg)' }} />}
      </button>
    </header>
  )
}
