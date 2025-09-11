'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Chart, DoughnutController, ArcElement, Legend, Tooltip } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Legend, Tooltip)

export default function PieTierDistribution() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)
  const router = useRouter()
  const [data, setData] = useState<{ free: number; standard: number; business: number; total: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
        const res = await fetch(`${baseUrl}/admin/companies/stats/tier-distribution`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const j = await res.json()
        setData({ free: j.free || 0, standard: j.standard || 0, business: j.business || 0, total: j.total || 0 })
      } catch (e: any) {
        setError(e.message || '조회 실패')
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !data) return
    const ctx = canvasRef.current.getContext('2d')!

    const labels = ['Free', 'Standard', 'Business']
    const counts = [data.free, data.standard, data.business]

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          { data: counts, backgroundColor: ['#9ca3af', '#14b8a6', '#3b82f6'], borderColor: 'rgba(0,0,0,0.8)', borderWidth: 2 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, color: '#9ca3af' } } },
        onClick: (_, elements) => {
          if (!elements.length) return
          const idx = elements[0].index
          const tiers = ['free', 'standard', 'business']
          const tier = tiers[idx]
          router.push(`/admin/companies?tier=${tier}`)
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [router, data])

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
} 