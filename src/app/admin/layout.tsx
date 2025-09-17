'use client'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/navigation/Sidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin'

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-neutral-900 to-black" aria-hidden />
      <Sidebar />
      <main className="pl-60">
        <div className="w-full px-6 md:px-8 py-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  )
} 