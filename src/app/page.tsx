'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // 루트 경로 접속 시 로그인 페이지로 리다이렉트
    router.push('/admin')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
        <p className="text-white/70">로그인 페이지로 이동 중...</p>
      </div>
    </div>
  )
}