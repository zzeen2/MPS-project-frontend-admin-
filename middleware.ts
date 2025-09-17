import { NextRequest, NextResponse } from 'next/server'

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  const bytes = new Uint8Array(sigBuf)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    const h = bytes[i].toString(16).padStart(2, '0')
    hex += h
  }
  return hex
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

async function verifyTokenEdge(token: string | undefined): Promise<{ ok: boolean; payload: string | null }> {
  if (!token) return { ok: false, payload: null }
  const i = token.lastIndexOf('.')
  if (i < 0) return { ok: false, payload: null }
  const payload = token.slice(0, i)
  const sig = token.slice(i + 1)
  const expected = await hmacSha256Hex(payload, process.env.SESSION_SECRET || '')
  const ok = safeEqualHex(sig, expected)
  return { ok, payload: ok ? payload : null }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAuthApi = pathname === '/admin/login' || pathname === '/admin/logout' || pathname === '/admin/refresh-token'
  const isProxyApi = pathname.startsWith('/admin/musics')
  const isOptions = req.method === 'OPTIONS'
  const isPublicLogin = pathname === '/admin' || pathname === '/admin/' || isAuthApi || isProxyApi
  const isProtected = pathname.startsWith('/admin') && !isPublicLogin && !isOptions

  if (!isProtected) {
    return NextResponse.next()
  }

  const token = req.cookies.get('admin_session')?.value
  const { ok, payload } = await verifyTokenEdge(token)

  if (!ok || !payload) {
    const loginUrl = new URL('/admin', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const [role, issuedAtStr] = payload.split('|')
  if (role !== 'admin') {
    const loginUrl = new URL('/admin', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const issuedAt = Number(issuedAtStr)
  const maxAgeMs = 8 * 60 * 60 * 1000
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > maxAgeMs) {
    const loginUrl = new URL('/admin', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
} 