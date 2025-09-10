type Props = {
  title: string
  value: string
  change?: { text: string; tone?: 'positive' | 'negative' | 'neutral' }
  breakdown?: string
}

export default function StatCard({ title, value, change, breakdown }: Props) {
  const toneClass =
    change?.tone === 'positive'
      ? 'text-emerald-400'
      : change?.tone === 'negative'
      ? 'text-red-400'
      : 'text-white/60'

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-6">
      <div className="mb-4 text-xs uppercase tracking-wide text-white/60">{title}</div>
      <div className="mb-3 text-3xl font-bold text-white">{value}</div>
      {change && <div className={`text-xs ${toneClass}`}>{change.text}</div>}
      {breakdown && <div className="mt-2 text-xs text-white/60">{breakdown}</div>}
    </div>
  )
} 