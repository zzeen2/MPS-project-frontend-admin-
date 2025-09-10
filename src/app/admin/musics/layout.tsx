'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MusicsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin/musics' && pathname === '/admin/musics') return true
    if (href === '/admin/musics/categories' && pathname === '/admin/musics/categories') return true
    return false
  }

  return (
    <div className="w-full">
      <div className="mb-6 border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold text-white">음원 관리</h1>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <Link
            href="/admin/musics"
            className={`transition-colors duration-200 ${
              isActive('/admin/musics') 
                ? 'text-teal-400 font-medium' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            음원 목록
          </Link>
          <span className="text-white/30">·</span>
          <Link
            href="/admin/musics/categories"
            className={`transition-colors duration-200 ${
              isActive('/admin/musics/categories') 
                ? 'text-teal-400 font-medium' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            카테고리 관리
          </Link>
        </div>
      </div>
      {children}
    </div>
  )
} 