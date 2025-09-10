import type { ReactNode } from 'react'

export default function RevenueLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      <div className="mb-6 border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold text-white">매출 관리</h1>
        <p className="mt-1 text-sm text-teal-400">매출 대시보드 · 매출 분석</p>
      </div>
      {children}
    </div>
  )
} 