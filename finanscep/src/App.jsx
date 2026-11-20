import { useState, useEffect } from 'react'
import LoginScreen from './components/LoginScreen.jsx'
import Dashboard from './Dashboard.jsx'

export default function App() {
  // null = kontrol ediliyor, true = girişli, false = girişsiz
  const [authed, setAuthed] = useState(null)

  const checkSession = () => {
    fetch('/api/session', { credentials: 'same-origin', cache: 'no-store' })
      .then(r => r.json())
      .then(d => setAuthed(!!d.authenticated))
      .catch(() => setAuthed(false))
  }

  useEffect(() => { checkSession() }, [])

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' })
    } catch {}
    setAuthed(false)
  }

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="muted text-sm">Yükleniyor…</div>
      </div>
    )
  }

  if (!authed) {
    return <LoginScreen onSuccess={checkSession} />
  }

  return <Dashboard onLogout={logout} />
}
