'use client'
import { useEffect, useRef } from 'react'
import { Chart, DoughnutController, ArcElement, Legend, Tooltip } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Legend, Tooltip)

export default function PieRewardDistribution() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')!

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['MelOn', 'Spotify', 'Kakao', '기타'],
        datasets: [
          {
            data: [35, 25, 20, 20],
            backgroundColor: ['#ffffff', '#d1d5db', '#9ca3af', '#6b7280'],
            borderColor: 'rgba(0,0,0,0.8)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15, color: '#9ca3af' } },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [])

  return <canvas ref={canvasRef} className="h-[280px] w-full" />
} 