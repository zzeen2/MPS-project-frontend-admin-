import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export default function Card({ children, className }: Props) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-xl shadow-black/30 backdrop-blur-md ${className || ''}`}>
      {children}
    </div>
  )
} 