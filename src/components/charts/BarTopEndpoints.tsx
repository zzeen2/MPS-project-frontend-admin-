'use client'
import { useEffect, useRef } from 'react'
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Legend, Tooltip } from 'chart.js'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Legend, Tooltip)

export default function BarTopEndpoints() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')!

    // 더미 데이터: Top5 엔드포인트 호출 수
    const labels = [
      '/v1/musics/search',
      '/v1/companies',
      '/v1/rewards/payouts',
      '/v1/plays/ingest',
      '/v1/auth/refresh',
    ]
    const data = [9200, 7300, 5400, 5100, 4200]

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '호출 수',
            data,
            backgroundColor: 'rgba(255,255,255,0.10)',
            borderColor: '#ffffff',
            borderWidth: 1,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#9ca3af' }, beginAtZero: true },
          y: { grid: { display: false }, ticks: { color: '#9ca3af' } },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [])

  return <canvas ref={canvasRef} className="h-[280px] w-full" />
} 