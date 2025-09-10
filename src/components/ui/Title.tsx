import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  variant?: 'section' | 'card'
  className?: string
}

export default function Title({ children, variant = 'card', className }: Props) {
  const size = variant === 'section' ? 'text-lg' : 'text-base'
  const classes = className ? `${className}` : ''
  return (
    <div className={`flex items-center gap-2 ${classes}`}>
      <span className="h-4 w-1.5 rounded bg-teal-300" />
      <div className={`${size} font-semibold tracking-wide text-white drop-shadow`}>{children}</div>
    </div>
  )
} 