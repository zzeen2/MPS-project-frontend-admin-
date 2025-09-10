'use client'
import { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip)

export default function LineApiTrend() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')!

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['월', '화', '수', '목', '금', '토', '일'],
        datasets: [
          {
            label: 'Free',
            data: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
            borderColor: '#ffffff',
            backgroundColor: 'rgba(255,255,255,0.06)',
            pointRadius: 0,
            tension: 0.3,
            borderWidth: 2,
          },
          {
            label: 'Standard',
            data: [2000, 3000, 4000, 6000, 3000, 4000, 5500],
            borderColor: '#9ca3af',
            backgroundColor: 'rgba(156,163,175,0.06)',
            pointRadius: 0,
            tension: 0.3,
            borderWidth: 2,
          },
          {
            label: 'Business',
            data: [800, 1200, 2000, 3000, 1500, 2200, 2800],
            borderColor: '#6b7280',
            backgroundColor: 'rgba(107,114,128,0.06)',
            pointRadius: 0,
            tension: 0.3,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, padding: 20, color: '#9ca3af' } },
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