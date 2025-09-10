'use client'

import Link from 'next/link'

type BreadcrumbItem = {
  label: string
  href?: string
  isActive?: boolean
}

type Props = {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-white/30">/</span>
          )}
          {item.href && !item.isActive ? (
            <Link
              href={item.href}
              className="text-white/60 hover:text-white transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className={item.isActive ? "text-teal-400 font-medium" : "text-white/60"}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
} 