'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export default function SystemLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  const getActiveStyle = (path: string) => {
    return pathname === path ? 'text-teal-400' : 'text-white/60'
  }

  return (
    <div className="w-full">
      <div className="mb-6 border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold text-white">시스템 관리</h1>
        <p className="mt-1 text-sm">
          <span className={getActiveStyle('/admin/system/tiers')}>구독제 등급</span>
          <span className="text-white/60"> · </span>
          <span className={getActiveStyle('/admin/system/api')}>API 키/모니터링</span>
          <span className="text-white/60"> · </span>
          <span className={getActiveStyle('/admin/system/tokens')}>토큰/온체인</span>
        </p>
      </div>
      {children}
    </div>
  )
} 