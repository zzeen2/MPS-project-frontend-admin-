/**
 * 인증 관련 유틸리티 함수들
 */

import jwt from 'jsonwebtoken'

// JWT 토큰 생성 (서버사이드용)
export function sign(payload: string): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key'
  return jwt.sign({ data: payload }, secret, { expiresIn: '8h' })
}

// JWT 토큰 검증 (서버사이드용)
export function verify(token: string): any {
  const secret = process.env.JWT_SECRET || 'your-secret-key'
  return jwt.verify(token, secret)
}

// 토큰 유효성 검사
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  
  return !!(accessToken && refreshToken)
}

// 토큰 제거
export function clearAuth(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('adminId')
  
  // 쿠키도 삭제 (미들웨어용)
  document.cookie = 'accessToken=; path=/; max-age=0'
  document.cookie = 'refreshToken=; path=/; max-age=0'
}

// 토큰 갱신
export async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return false
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/admin/refresh-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('adminId', data.adminId)
      
      // 쿠키도 업데이트 (미들웨어용)
      const isProduction = process.env.NODE_ENV === 'production'
      const secureFlag = isProduction ? '; secure' : ''
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${8 * 60 * 60}${secureFlag}; samesite=strict`
      document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${8 * 60 * 60}${secureFlag}; samesite=strict`
      
      return true
    } else {
      clearAuth()
      return false
    }
  } catch (error) {
    console.error('토큰 갱신 실패:', error)
    clearAuth()
    return false
  }
}

// API 요청 시 토큰 자동 갱신
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem('accessToken')
  
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    ...options.headers
  }
  
  let response = await fetch(url, { ...options, headers })
  
  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const newAccessToken = localStorage.getItem('accessToken')
      const newHeaders = {
        ...headers,
        'Authorization': `Bearer ${newAccessToken}`
      }
      response = await fetch(url, { ...options, headers: newHeaders })
    }
  }
  
  return response
}