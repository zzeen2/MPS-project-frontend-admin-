type Props = {
  title: string
  value: string
  caption?: string
  progress?: number // 0~100
}

export default function KpiCard({ title, value, caption, progress }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-6">
      <div className="text-xs uppercase tracking-wide text-white/60">{title}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
      {caption && <div className="mt-1 text-xs text-white/60">{caption}</div>}
      {typeof progress === 'number' && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded bg-white/10">
          <div className="h-full rounded bg-white/40" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      )}
    </div>
  )
} 