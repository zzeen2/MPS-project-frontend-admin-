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

export default function MonthlyRevenueCard() {
  const [cur, setCur] = useState<{ mtd: number; forecast: number } | null>(null)
  const [prev, setPrev] = useState<{ mtd: number; forecast: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevYM = useMemo(() => getPrevYearMonth(), [])

  useEffect(() => {
    let aborted = false
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
        const curRes = await fetch(`${baseUrl}/admin/musics/stats/revenue/forecast`)
        if (!curRes.ok) throw new Error(`HTTP ${curRes.status}`)
        const cur = await curRes.json()
        const prevRes = await fetch(`${baseUrl}/admin/musics/stats/revenue/forecast?yearMonth=${prevYM}`)
        if (!prevRes.ok) throw new Error(`HTTP ${prevRes.status}`)
        const prv = await prevRes.json()
        if (aborted) return
        setCur({ mtd: Number(cur.mtd ?? 0), forecast: Number(cur.forecast ?? 0) })
        setPrev({ mtd: Number(prv.mtd ?? 0), forecast: Number(prv.forecast ?? 0) })
      } catch (e: any) {
        if (aborted) return
        setError(e.message || '조회 실패')
        setCur(null)
        setPrev(null)
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    fetchStats()
    return () => { aborted = true }
  }, [prevYM])

  const mtd = cur?.mtd ?? 0
  const prevMtd = prev?.mtd ?? 0
  const pct = prevMtd > 0 ? Math.round(((mtd - prevMtd) / prevMtd) * 100) : null
  const sign = (mtd - prevMtd) > 0 ? '+' : (mtd - prevMtd) < 0 ? '' : ''

  const fmt = (n: number) => `₩${Math.floor(n).toLocaleString()}`

  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">이번 달 누적 매출</Title>
        <div className="text-3xl font-bold text-white">{loading ? '...' : (error ? '-' : fmt(mtd))}</div>
        <div className="space-y-0.5">
          <div className="text-sm text-teal-300">
            {loading ? '' : pct === null ? '(전월 대비 -)' : `(전월 대비 ${sign}${pct}%)`}
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="text-xs text-white/60">전월 누적: {loading || error ? '-' : fmt(prevMtd)}</div>
            <div className="text-xs text-white/60">기준일: {loading || error ? '-' : new Date().toLocaleDateString('ko-KR')}</div>
          </div>
        </div>
      </div>
    </Card>
  )
} 