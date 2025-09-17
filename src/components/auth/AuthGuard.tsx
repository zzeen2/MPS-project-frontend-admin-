'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, refreshAccessToken, clearAuth } from '@/lib/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 미들웨어가 기본 보안을 담당하므로 간단한 확인만
    const checkAuth = () => {
      const hasToken = isAuthenticated()
      if (hasToken) {
        setIsAuth(true)
      } else {
        setIsAuth(false)
        clearAuth()
        router.replace('/admin')
      }
      setIsLoading(false)
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'accessToken' || event.key === 'refreshToken') {
        checkAuth()
      }
    }

    // 초기 인증 확인
    checkAuth()
    
    // 다른 탭에서의 localStorage 변경 감지
    window.addEventListener('storage', handleStorageChange)
    
    // 같은 탭에서의 localStorage 변경 감지를 위한 주기적 확인 (2초마다)
    const intervalId = setInterval(() => {
      const hasToken = isAuthenticated()
      if (!hasToken && isAuth) {
        console.log('토큰 삭제 감지, 로그인 페이지로 리다이렉트')
        setIsAuth(false)
        clearAuth()
        router.replace('/admin')
      }
    }, 2000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
    }
  }, [router, isAuth])

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white/70">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  // 인증되지 않은 경우 - 리다이렉트 중이므로 로딩 화면 표시
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white/70">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    )
  }

  // 인증된 경우
  return <>{children}</>
}
