'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RewardsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin/rewards/companies' && pathname === '/admin/rewards/companies') return true
    if (href === '/admin/rewards/musics' && pathname === '/admin/rewards/musics') return true
    return false
  }

  return (
    <div className="w-full">
      <div className="mb-6 border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold text-white">리워드 관리</h1>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <Link
            href="/admin/rewards/companies"
            className={`transition-colors duration-200 ${
              isActive('/admin/rewards/companies') 
                ? 'text-teal-400 font-medium' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            기업별 현황
          </Link>
          <span className="text-white/30">·</span>
          <Link
            href="/admin/rewards/musics"
            className={`transition-colors duration-200 ${
              isActive('/admin/rewards/musics') 
                ? 'text-teal-400 font-medium' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            음원별 현황
          </Link>
        </div>
      </div>
      {children}
    </div>
  )
} 