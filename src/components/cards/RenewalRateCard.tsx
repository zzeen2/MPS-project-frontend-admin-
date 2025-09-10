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

export default function RenewalRateCard() {
  const [data, setData] = useState<{ rate: number | null; churned: number; reactivated: number } | null>(null)
  const [prevRate, setPrevRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevYM = useMemo(() => getPrevYearMonth(), [])

  useEffect(() => {
    let aborted = false
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)
        const curRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/companies/stats/renewal`)
        if (!curRes.ok) throw new Error(`HTTP ${curRes.status}`)
        const cur = await curRes.json()

        const prevRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/companies/stats/renewal?yearMonth=${prevYM}`)
        if (!prevRes.ok) throw new Error(`HTTP ${prevRes.status}`)
        const prv = await prevRes.json()

        if (aborted) return
        setData({ rate: cur.rate ?? null, churned: Number(cur.churned ?? 0), reactivated: Number(cur.reactivated ?? 0) })
        setPrevRate(prv.rate ?? null)
      } catch (e: any) {
        if (aborted) return
        setError(e.message || '조회 실패')
        setData(null)
        setPrevRate(null)
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    fetchAll()
    return () => { aborted = true }
  }, [prevYM])

  const rate = data?.rate ?? null
  const displayRate = rate ?? 0
  const ppDelta = rate !== null && prevRate !== null ? Math.round(rate - prevRate) : null
  const churned = data?.churned ?? 0
  const reactivated = data?.reactivated ?? 0

  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">구독 갱신률</Title>
        <div className="text-3xl font-bold text-white">{loading ? '...' : (error ? '-' : `${displayRate}%`)}</div>
        <div className="space-y-0.5">
          <div className="text-sm text-teal-300">
            {loading ? '' : ppDelta === null ? '(전월 대비 -)' : `(전월 대비 ${ppDelta > 0 ? '+' : ''}${ppDelta}%)`}
          </div>
          <div className="mt-2">
            <div className="text-xs text-white/60">신규 해지: {loading || error ? '-' : `${churned.toLocaleString()}개 기업`} · 재구독: {loading || error ? '-' : `${reactivated.toLocaleString()}개 기업`}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}