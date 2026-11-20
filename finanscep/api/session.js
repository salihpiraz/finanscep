import { getConfig, verifySession, parseCookies } from './_auth.js'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ authenticated: false })
  }

  let cfg
  try {
    cfg = getConfig()
  } catch {
    return res.status(200).json({ authenticated: false })
  }

  const cookies = parseCookies(req.headers.cookie)
  const payload = verifySession(cookies.session, cfg.sessionSecret)
  if (!payload) return res.status(200).json({ authenticated: false })
  return res.status(200).json({ authenticated: true, user: payload.u })
}
