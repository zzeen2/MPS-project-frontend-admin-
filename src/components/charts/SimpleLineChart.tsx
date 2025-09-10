'use client'
import { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip)

type Props = { 
  labels?: string[]; 
  series?: { label: string; data: number[] }[];
  colors?: string[];
}

export default function SimpleLineChart({ labels, series, colors }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    console.log('SimpleLineChart - labels:', labels)
    console.log('SimpleLineChart - series:', series)
    console.log('SimpleLineChart - colors:', colors)

    const defaultLabels = labels ?? ['1','2','3','4','5','6','7']
    const defaultSeries = series ?? [
      { label: 'A', data: [12, 19, 7, 15, 12, 18, 14] },
      { label: 'B', data: [8, 11, 13, 9, 10, 12, 9] },
    ]

    console.log('SimpleLineChart - defaultLabels:', defaultLabels)
    console.log('SimpleLineChart - defaultSeries:', defaultSeries)

    function destroy(){ chartRef.current?.destroy(); chartRef.current = null }
    function create(width:number, height:number){
      const c = canvasRef.current
      if (!c) return
      c.width = Math.max(300, Math.floor(width))
      c.height = Math.floor(height)
      const ctx = c.getContext('2d')!
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: defaultLabels,
          datasets: defaultSeries.map((s, i) => {
            const defaultColors = ['#10b981', '#8b5cf6', '#3b82f6', '#9ca3af']
            const chartColors = colors || defaultColors
            const isDashed = s.label === '전일' || s.label === '지난주'
            return {
              label: s.label,
              data: s.data,
              borderColor: chartColors[i] || defaultColors[i] || '#9ca3af',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 2,
              borderDash: isDashed ? [5, 5] : [],
              pointRadius: 0,
              tension: 0.3,
            }
          }),
        },
        options: {
          responsive: false,
          animation: false,
          plugins: { 
            legend: { 
              position: 'top', 
              labels: { 
                color: '#9ca3af', 
                usePointStyle: true, 
                padding: 12 
              } 
            }, 
            tooltip: { 
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                title: function(context) {
                  return `${context[0].label}`
                },
                label: function(context) {
                  const label = context.dataset.label || ''
                  const value = context.parsed.y
                  return `${label}: ${value.toLocaleString()}회`
                },
                afterBody: function(context) {
                  // 추가 정보가 있는 경우 여기에 표시
                  return ''
                }
              }
            } 
          },
          scales: { 
            x: { 
              grid: { display: false }, 
              ticks: { color: '#9ca3af' } 
            }, 
            y: { 
              grid: { color: 'rgba(255,255,255,0.08)' }, 
              ticks: { color: '#9ca3af' }, 
              beginAtZero: true,
              max: undefined,
              min: 0
            } 
          },
        },
      })
    }

    const measure = () => {
      const rect = container.getBoundingClientRect()
      const width = rect.width
      const height = rect.height || 220
      if (!width) return // defer until layout is ready
      destroy(); create(width, height)
    }

    // Initial measure (may defer if width is 0)
    measure()
    const ro = new ResizeObserver(measure); ro.observe(container)
    return () => { ro.disconnect(); destroy() }
  }, [labels, series, colors])

  return (
    <div ref={containerRef} className="relative h-full min-w-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  )
} 