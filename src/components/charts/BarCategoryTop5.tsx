'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip } from 'chart.js'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip)

interface CategoryItem {
  category: string
  validPlays: number
  rank: number
}

export default function BarCategoryTop5() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)
  const router = useRouter()
  const [data, setData] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/admin/musics/stats/category-top5`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const j = await res.json()
        setData(j.items || [])
      } catch (e: any) {
        setError(e.message || '조회 실패')
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !data.length) return
    const canvas = canvasRef.current
    const parent = canvas.parentElement as HTMLElement

    const labels = data.map(item => item.category)
    const validPlays = data.map(item => item.validPlays)

    function destroy() {
      chartRef.current?.destroy()
      chartRef.current = null
    }

    function create(width: number) {
      const w = Math.max(300, Math.floor(width)) // 안전 최소폭
      canvas.width = w
      canvas.height = 280
      const ctx = canvas.getContext('2d')!
      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: { 
          labels, 
          datasets: [{ 
            label: '유효재생', 
            data: validPlays, 
            backgroundColor: ['rgba(52, 211, 153, 0.3)', 'rgba(167, 139, 250, 0.3)', 'rgba(96, 165, 250, 0.3)', 'rgba(251, 191, 36, 0.3)', 'rgba(248, 113, 113, 0.3)'],
            borderColor: ['#34d399', '#a78bfa', '#60a5fa', '#fbbf24', '#f87171'],
            borderWidth: 2
          }] 
        },
        options: {
          responsive: false,
          animation: false,
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.x.toLocaleString()}회 유효재생` } },
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#9ca3af' }, beginAtZero: true },
            y: { grid: { display: false }, ticks: { color: '#9ca3af' } },
          },
          onClick: (_, elements) => {
            if (!elements.length) return
            const idx = elements[0].index
            const category = data[idx]?.category
            if (category) {
              router.push(`/admin/musics?category=${encodeURIComponent(category)}`)
            }
          },
        },
      })
    }

    // 최초 생성 + width 변화에 따라 재생성
    const measureAndCreate = () => {
      const width = parent.getBoundingClientRect().width || parent.clientWidth || 600
      destroy()
      create(width)
    }

    measureAndCreate()

    const ro = new ResizeObserver(() => {
      measureAndCreate()
    })
    ro.observe(parent)

    return () => {
      ro.disconnect()
      destroy()
    }
  }, [router, data])

  return (
    <div className="relative h-full w-full overflow-hidden min-w-0">
      <canvas ref={canvasRef} className="block" />
    </div>
  )
} 