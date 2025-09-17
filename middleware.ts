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

  // 공개 경로들
  const isAuthApi = pathname === '/api/admin-login' || pathname === '/api/logout' || pathname === '/admin/refresh-token'
  const isPublicLogin = pathname === '/admin' || pathname === '/admin/' || isAuthApi
  const isOptions = req.method === 'OPTIONS'
  
  // 보호된 경로인지 확인
  const isProtected = pathname.startsWith('/admin') && !isPublicLogin && !isOptions

  if (!isProtected) {
    return NextResponse.next()
  }

  // JWT 토큰 확인 (쿠키에서)
  const accessToken = req.cookies.get('accessToken')?.value
  const refreshToken = req.cookies.get('refreshToken')?.value

  if (!accessToken || !refreshToken) {
    const loginUrl = new URL('/admin', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 간단한 토큰 존재 여부만 확인 (JWT 검증은 클라이언트에서)
  if (!accessToken || !refreshToken) {
    const loginUrl = new URL('/admin', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 토큰이 존재하면 통과 (실제 검증은 클라이언트에서)
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
} 