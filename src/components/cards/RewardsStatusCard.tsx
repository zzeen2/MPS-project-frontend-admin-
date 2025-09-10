import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

function getPrevYearMonth(now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 3600 * 1000)
  const y = kst.getUTCFullYear()
  const m = kst.getUTCMonth() + 1
  const prev = new Date(Date.UTC(y, m - 2, 1))
  const py = prev.getUTCFullYear()
  const pm = String(prev.getUTCMonth() + 1).padStart(2, '0')
  return `${py}-${pm}`
}

export default function RewardsStatusCard() {
  const [cur, setCur] = useState<{ eligible: number; filled: number; ratio: number | null } | null>(null)
  const [prev, setPrev] = useState<{ ratio: number | null } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevYM = useMemo(() => getPrevYearMonth(), [])

  useEffect(() => {
    let aborted = false
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)
        const curRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/stats/rewards/filled`)
        if (!curRes.ok) throw new Error(`HTTP ${curRes.status}`)
        const cur = await curRes.json()

        const prevRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/stats/rewards/filled?yearMonth=${prevYM}`)
        if (!prevRes.ok) throw new Error(`HTTP ${prevRes.status}`)
        const prv = await prevRes.json()

        if (aborted) return
        setCur({ eligible: Number(cur.eligible ?? 0), filled: Number(cur.filled ?? 0), ratio: cur.ratio ?? null })
        setPrev({ ratio: prv.ratio ?? null })
      } catch (e: any) {
        if (aborted) return
        setError(e.message || '조회 실패')
        setCur(null)
        setPrev(null)
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    fetchAll()
    return () => { aborted = true }
  }, [prevYM])

  const ratio = cur?.ratio ?? null
  const ppDelta = ratio !== null && prev?.ratio !== null ? Math.round((ratio - (prev?.ratio ?? 0))) : null
  const filled = cur?.filled ?? 0
  const eligible = cur?.eligible ?? 0

  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">리워드 한도 소진 비율</Title>
        <div className="text-3xl font-bold text-white">{loading ? '...' : (error ? '-' : (ratio === null ? '-' : `${ratio}%`))}</div>
        <div className="space-y-0.5">
          <div className="text-sm text-teal-300">
            {loading ? '' : ppDelta === null ? '(전월 대비 -)' : `(전월 대비 ${ppDelta > 0 ? '+' : ''}${ppDelta} pp)`}
          </div>
          <div className="mt-3 mb-2 h-1.5 w-full overflow-hidden rounded bg-white/10">
            <div className="h-full rounded bg-teal-300" style={{ width: `${Math.min(Math.max(ratio ?? 0, 0), 100)}%` }} />
          </div>
          <div className="text-xs text-white/60">소진: {loading || error ? '-' : `${filled.toLocaleString()}개`} · 대상: {loading || error ? '-' : `${eligible.toLocaleString()}개`}</div>
          <div className="text-xs text-white/50">*이번 달 리워드 지급 한도를 소진한 음원의 비율</div>
        </div>
      </div>
    </Card>
  )
} 