import crypto from 'crypto'

// ---- Ortam değişkenleri (fail-closed: eksikse sistem açılmaz) ----
function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error('Eksik ortam değişkeni: ' + name)
  return v
}

export function getConfig() {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: requireEnv('ADMIN_PASSWORD_HASH'),
    sessionSecret: requireEnv('SESSION_SECRET')
  }
}

// ---- Sabit zamanlı karşılaştırma (uzunluk farkı bile sızdırmaz) ----
export function constantTimeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

// ---- scrypt ile şifre doğrulama (yerleşik Node modülü, ek paket yok) ----
// Format: scrypt:N:r:p:saltHex:hashHex
let DUMMY_HASH = null
function getDummyHash() {
  if (!DUMMY_HASH) {
    const salt = crypto.randomBytes(16)
    const hash = crypto.scryptSync('dummy-password-for-timing-safety', salt, 64, { N: 16384, r: 8, p: 1 })
    DUMMY_HASH = 'scrypt:16384:8:1:' + salt.toString('hex') + ':' + hash.toString('hex')
  }
  return DUMMY_HASH
}

export function verifyScryptHash(password, storedHash) {
  const [scheme, nStr, rStr, pStr, saltHex, hashHex] = storedHash.split(':')
  if (scheme !== 'scrypt') return false
  const N = Number(nStr), r = Number(rStr), p = Number(pStr)
  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const actual = crypto.scryptSync(password, salt, expected.length, { N, r, p })
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

// Kullanıcı adı yanlış olsa bile AYNI miktarda iş yapılır (zamanlama saldırısına karşı)
export function checkCredentials(username, password, cfg) {
  const userOk = constantTimeEqual(username, cfg.username)
  const hashToCheck = userOk ? cfg.passwordHash : getDummyHash()
  const passOk = verifyScryptHash(password, hashToCheck)
  return userOk && passOk
}

// ---- İmzalı oturum belirteci (HMAC-SHA256, JWT kütüphanesi gerektirmez) ----
function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Buffer.from(str, 'base64')
}

export function signSession(payload, secret) {
  const body = b64url(JSON.stringify(payload))
  const sig = b64url(crypto.createHmac('sha256', secret).update(body).digest())
  return body + '.' + sig
}

export function verifySession(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = b64url(crypto.createHmac('sha256', secret).update(body).digest())
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  let payload
  try {
    payload = JSON.parse(b64urlDecode(body).toString('utf8'))
  } catch {
    return null
  }
  if (!payload || typeof payload.exp !== 'number' || Date.now() > payload.exp) return null
  return payload
}

export function parseCookies(header) {
  const out = {}
  if (!header) return out
  header.split(';').forEach(part => {
    const i = part.indexOf('=')
    if (i === -1) return
    const k = part.slice(0, i).trim()
    const v = part.slice(i + 1).trim()
    out[k] = decodeURIComponent(v)
  })
  return out
}

export function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (fwd) return String(fwd).split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

// ---- Bellek içi hız sınırlama / kilitleme (sıcak instance boyunca kalıcı) ----
// Not: Serverless soğuk başlangıçta sıfırlanır. Kalıcı/çok-bölgeli koruma için
// Vercel KV veya Upstash Redis eklenmesi önerilir (README'de anlatılıyor).
const attempts = new Map()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const LOCK_MS = 15 * 60 * 1000

export function checkRateLimit(key) {
  const now = Date.now()
  const rec = attempts.get(key)
  if (!rec) return { allowed: true }
  if (rec.lockedUntil && now < rec.lockedUntil) {
    return { allowed: false, retryAfterSec: Math.ceil((rec.lockedUntil - now) / 1000) }
  }
  if (now - rec.firstAttempt > WINDOW_MS) {
    attempts.delete(key)
    return { allowed: true }
  }
  return { allowed: true }
}

export function recordFailure(key) {
  const now = Date.now()
  const rec = attempts.get(key) || { count: 0, firstAttempt: now }
  if (now - rec.firstAttempt > WINDOW_MS) {
    rec.count = 0
    rec.firstAttempt = now
  }
  rec.count += 1
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCK_MS
  }
  attempts.set(key, rec)
}

export function clearFailures(key) {
  attempts.delete(key)
}

export function originIsTrusted(req) {
  const host = req.headers.host
  const origin = req.headers.origin || req.headers.referer
  if (!origin) return true // bazı istemciler göndermez; eksikse engellemiyoruz
  try {
    const u = new URL(origin)
    return u.host === host
  } catch {
    return false
  }
}
