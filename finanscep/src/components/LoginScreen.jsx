import { useState } from 'react'

export default function LoginScreen({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)

  const submit = async e => {
    e.preventDefault()
    if (loading || retryAfter > 0) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username: username.trim(), password })
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 429) {
        const sec = Number(res.headers.get('Retry-After')) || 60
        setRetryAfter(sec)
        setError(data.error || 'Çok fazla deneme yapıldı.')
        const t = setInterval(() => {
          setRetryAfter(s => {
            if (s <= 1) { clearInterval(t); return 0 }
            return s - 1
          })
        }, 1000)
        return
      }
      if (!res.ok) {
        setError(data.error || 'Giriş başarısız.')
        setPassword('')
        return
      }
      onSuccess()
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--bg)' }}>
      <form onSubmit={submit} className="card w-full max-w-sm p-6" autoComplete="off">
        <div className="text-center mb-6">
          <div className="text-2xl font-extrabold tracking-tight">
            Finans<span style={{ color: 'var(--accent)' }}>Cep</span>
          </div>
          <p className="muted text-sm mt-1">Devam etmek için giriş yap</p>
        </div>

        <label className="block text-xs font-semibold mb-1 muted" htmlFor="u">Kullanıcı adı</label>
        <input
          id="u"
          value={username}
          onChange={e => setUsername(e.target.value)}
          maxLength={100}
          autoComplete="username"
          className="w-full h-12 rounded-2xl px-4 mb-3 outline-none"
          style={{ background: 'var(--card2)', color: 'var(--text)' }}
          required
        />

        <label className="block text-xs font-semibold mb-1 muted" htmlFor="p">Şifre</label>
        <input
          id="p"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          maxLength={200}
          autoComplete="current-password"
          className="w-full h-12 rounded-2xl px-4 mb-3 outline-none"
          style={{ background: 'var(--card2)', color: 'var(--text)' }}
          required
        />

        {error && (
          <div className="text-sm font-semibold mb-3 rounded-xl px-3 py-2" style={{ background: 'rgba(248,113,113,.12)', color: 'var(--red)' }}>
            {error}{retryAfter > 0 ? ' (' + retryAfter + 's)' : ''}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || retryAfter > 0}
          className="grad w-full h-12 rounded-2xl text-white font-bold disabled:opacity-40 active:scale-95 transition"
        >
          {loading ? 'Kontrol ediliyor…' : retryAfter > 0 ? `Lütfen bekleyin (${retryAfter}s)` : 'Giriş yap'}
        </button>
      </form>
    </div>
  )
}
