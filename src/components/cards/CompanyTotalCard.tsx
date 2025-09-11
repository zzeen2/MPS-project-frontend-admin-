import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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

export default function CompanyTotalCard() {
  const [curTotal, setCurTotal] = useState<number | null>(null)
  const [prevTotal, setPrevTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const prevYM = useMemo(() => getPrevYearMonth(), [])

  useEffect(() => {
    let aborted = false
    const fetchTotals = async () => {
      try {
        setLoading(true)
        setError(null)
        const curRes = await fetch(`/admin/companies/stats/total`)
        if (!curRes.ok) throw new Error(`HTTP ${curRes.status}`)
        const cur = await curRes.json()
        const prevRes = await fetch(`/admin/companies/stats/total?yearMonth=${prevYM}`)
        if (!prevRes.ok) throw new Error(`HTTP ${prevRes.status}`)
        const prv = await prevRes.json()
        if (aborted) return
        setCurTotal(Number(cur.total ?? 0))
        setPrevTotal(Number(prv.total ?? 0))
      } catch (e: any) {
        if (aborted) return
        setError(e.message || '조회 실패')
        setCurTotal(null)
        setPrevTotal(null)
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    fetchTotals()
    return () => { aborted = true }
  }, [prevYM])

  const diff = (curTotal ?? 0) - (prevTotal ?? 0)
  const pct = prevTotal && prevTotal > 0 ? Math.round((diff / prevTotal) * 100) : null
  const sign = diff > 0 ? '+' : diff < 0 ? '' : ''

  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">총 가입 기업 수</Title>
        <div className="text-3xl font-bold text-white">{loading ? '...' : (error ? '-' : `${(curTotal ?? 0).toLocaleString()}개`)}</div>
        {!error && (
          <div className="space-y-0.5">
            <div className="text-sm text-teal-300">
              {loading ? '' : pct === null ? '(전월 대비 -)' : `(전월 대비 ${sign}${pct}%)`}
            </div>
            <div className="mt-2">
              <div className="text-xs text-white/60">전월: {loading ? '-' : (prevTotal ?? 0).toLocaleString()}개</div>
            </div>
          </div>
        )}
        <div className="mt-3">
          <Link href="/admin/companies" className="text-xs text-teal-300 underline underline-offset-4 hover:text-teal-200">기업 관리 →</Link>
        </div>
      </div>
    </Card>
  )
} 