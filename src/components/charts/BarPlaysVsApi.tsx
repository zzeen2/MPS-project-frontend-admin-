'use client'
import { useEffect, useRef } from 'react'
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Legend, Tooltip } from 'chart.js'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Legend, Tooltip)

export default function BarPlaysVsApi() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')!

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1주', '2주', '3주', '4주'],
        datasets: [
          {
            label: '유효재생',
            data: [8420, 9200, 7800, 8900],
            backgroundColor: 'rgba(255,255,255,0.10)',
            borderColor: '#ffffff',
            borderWidth: 1,
          },
          {
            label: 'API 호출',
            data: [4000, 4500, 3800, 4200],
            backgroundColor: 'rgba(156,163,175,0.10)',
            borderColor: '#9ca3af',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, padding: 15, color: '#9ca3af' } },
          tooltip: { enabled: true },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
          y: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#9ca3af' }, beginAtZero: true },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [])

  return <canvas ref={canvasRef} className="h-[280px] w-full" />
} 