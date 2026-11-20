import {
  getConfig, checkCredentials, signSession, getClientIp,
  checkRateLimit, recordFailure, clearFailures, originIsTrusted
} from './_auth.js'

export const config = { runtime: 'nodejs' }

const GENERIC_ERROR = 'Kullanıcı adı veya şifre hatalı.'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Yöntem desteklenmiyor.' })
  }

  // CSRF: istek bu siteden mi geliyor?
  if (!originIsTrusted(req)) {
    return res.status(403).json({ error: 'İstek doğrulanamadı.' })
  }

  // Gövdeyi katı biçimde doğrula — JSON olmayan/şekli bozuk her şey reddedilir.
  const body = req.body
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: GENERIC_ERROR })
  }
  const { username, password } = body
  if (
    typeof username !== 'string' || typeof password !== 'string' ||
    username.length === 0 || password.length === 0 ||
    username.length > 100 || password.length > 200
  ) {
    return res.status(400).json({ error: GENERIC_ERROR })
  }

  const ip = getClientIp(req)
  const rlKey = ip + ':' + username.slice(0, 50)
  const rl = checkRateLimit(rlKey)
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfterSec))
    return res.status(429).json({ error: 'Çok fazla başarısız deneme. Lütfen biraz sonra tekrar deneyin.' })
  }

  let cfg
  try {
    cfg = getConfig()
  } catch {
    // Ortam değişkenleri eksikse sistem "fail closed" olur: kimse giremez.
    return res.status(503).json({ error: 'Kimlik doğrulama sistemi yapılandırılmamış.' })
  }

  const ok = checkCredentials(username, password, cfg)
  if (!ok) {
    recordFailure(rlKey)
    return res.status(401).json({ error: GENERIC_ERROR })
  }

  clearFailures(rlKey)

  const now = Date.now()
  const maxAgeSec = 60 * 60 * 12 // 12 saat
  const token = signSession({ u: cfg.username, iat: now, exp: now + maxAgeSec * 1000 }, cfg.sessionSecret)

  const cookieParts = [
    `session=${token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${maxAgeSec}`
  ]
  res.setHeader('Set-Cookie', cookieParts.join('; '))
  return res.status(200).json({ ok: true })
}
