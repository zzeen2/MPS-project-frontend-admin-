'use client'
import { useEffect, useState } from 'react'

type Props = {
  title: string
  subtitle?: string
  lastUpdated?: string
}

export default function DashboardHeader({ title, subtitle, lastUpdated }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-teal-300">{subtitle}</p>}
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span>마지막 업데이트: {lastUpdated}</span>
            <button
              onClick={() => location.reload()}
              className="rounded border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              새로고침
            </button>
          </div>
        )}
      </div>
      <div className="mt-4 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent"></div>
    </div>
  )
} 