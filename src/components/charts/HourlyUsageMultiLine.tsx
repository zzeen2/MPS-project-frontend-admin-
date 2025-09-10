'use client'
import { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip)

export default function HourlyUsageMultiLine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const parent = canvas.parentElement as HTMLElement

    // 데이터 (더미)
    const labels = Array.from({ length: 24 }, (_, i) => `${i}시`)
    const free = [120,140,160,180,200,260,320,420,520,600,640,700,740,760,720,680,640,600,560,500,420,300,220,160]
    const standard = free.map(v => Math.round(v * 1.2))
    const business = free.map(v => Math.round(v * 0.8))
    const yesterdayAvg = free.map((_, i) => Math.round((free[i] + standard[i] + business[i]) / 3 * 0.95))

    // 기존 차트 제거 후 재생성
    function destroy() { chartRef.current?.destroy(); chartRef.current = null }
    function create(width: number) {
      canvas.width = width
      canvas.height = 280
      const ctx = canvas.getContext('2d')!
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Free', data: free, borderColor: '#ffffff', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 2, pointRadius: 0, tension: 0.3 },
            { label: 'Standard', data: standard, borderColor: '#9ca3af', backgroundColor: 'rgba(156,163,175,0.06)', borderWidth: 2, pointRadius: 0, tension: 0.3 },
            { label: 'Business', data: business, borderColor: '#6b7280', backgroundColor: 'rgba(107,114,128,0.06)', borderWidth: 2, pointRadius: 0, tension: 0.3 },
            { label: '전일 평균', data: yesterdayAvg, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.08)', borderDash: [6,6], borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
          ],
        },
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, padding: 12, color: '#9ca3af' } },
            tooltip: {
              callbacks: {
                label(ctx) {
                  const idx = ctx.dataIndex
                  const totals = (ctx.chart.data.datasets as any[]).slice(0,3).reduce((s, ds) => s + (ds.data[idx] as number), 0)
                  const val = ctx.parsed.y
                  const pct = totals ? Math.round((val / totals) * 100) : 0
                  return `${ctx.dataset.label}: ${val.toLocaleString()} (${pct}%)`
                }
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
            y: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#9ca3af' }, beginAtZero: true }
          }
        }
      })
    }

    destroy();
    create(parent.clientWidth)

    return () => { destroy() }
  }, [])

  return (
    <div className="relative h-[280px] w-full overflow-hidden">
      <canvas ref={canvasRef} className="block" />
    </div>
  )
} 