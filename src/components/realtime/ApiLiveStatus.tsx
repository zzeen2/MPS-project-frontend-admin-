'use client'
import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'

export default function ApiLiveStatus() {
  const [callsPerMin, setCallsPerMin] = useState(1240)
  const [errorRate, setErrorRate] = useState(1.2) // %
  const [p95ms, setP95ms] = useState(380)

  useEffect(() => {
    const id = setInterval(() => {
      setCallsPerMin((v) => Math.max(200, v + Math.round((Math.random() - 0.5) * 80)))
      setErrorRate((v) => Math.max(0, Math.min(10, +(v + (Math.random() - 0.5) * 0.3).toFixed(2))))
      setP95ms((v) => Math.max(120, v + Math.round((Math.random() - 0.5) * 30)))
    }, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <Card>
      <div className="mb-2 text-xs uppercase tracking-wider text-white/60">실시간 API 호출 현황</div>
      <div className="grid grid-cols-3 gap-4 text-white">
        <div>
          <div className="text-xs text-white/60">Calls / min</div>
          <div className="mt-1 text-2xl font-semibold">{callsPerMin.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-white/60">Error rate</div>
          <div className="mt-1 text-2xl font-semibold">{errorRate}%</div>
        </div>
        <div>
          <div className="text-xs text-white/60">p95 latency</div>
          <div className="mt-1 text-2xl font-semibold">{p95ms}ms</div>
        </div>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full rounded bg-white/40" style={{ width: `${Math.min(100, Math.round((callsPerMin / 2000) * 100))}%` }} />
      </div>
      <div className="mt-1 text-right text-[10px] text-white/50">모의 데이터 • 2초마다 갱신</div>
    </Card>
  )
} 