'use client'
import { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip)

type HourlyData = {
  hour: string
  free: { total: number; valid: number; lyrics: number }
  standard: { total: number; valid: number; lyrics: number }
  business: { total: number; valid: number; lyrics: number }
  prevAvg: number
}

type Props = { 
  data: HourlyData[]
  colors?: string[]
}

export default function DetailedLineChart({ data, colors }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const labels = data.map(d => d.hour)
    const series = [
      { 
        label: 'Free (총 호출)', 
        data: data.map(d => (d.free?.total || 0) + (d.free?.lyrics || 0)),
        rawData: data.map(d => d.free)
      },
      { 
        label: 'Standard (총 호출)', 
        data: data.map(d => (d.standard?.total || 0) + (d.standard?.lyrics || 0)),
        rawData: data.map(d => d.standard)
      },
      { 
        label: 'Business (총 호출)', 
        data: data.map(d => (d.business?.total || 0) + (d.business?.lyrics || 0)),
        rawData: data.map(d => d.business)
      }
    ]

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
          labels: labels,
          datasets: series.map((s, i) => {
            const defaultColors = ['#10b981', '#8b5cf6', '#3b82f6', '#9ca3af']
            const chartColors = colors || defaultColors
            return {
              label: s.label,
              data: s.data,
              rawData: s.rawData, // 원본 데이터 저장
              borderColor: chartColors[i] || defaultColors[i] || '#9ca3af',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 2,
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
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              padding: 12,
              callbacks: {
                title: function(context) {
                  return `${context[0].label}`
                },
                label: function(context) {
                  const dataset = context.dataset
                  const dataIndex = context.dataIndex
                  const rawData = (dataset as any).rawData?.[dataIndex]
                  
                  if (!rawData) {
                    return `${dataset.label}: ${context.parsed.y.toLocaleString()}회`
                  }
                  
                  const total = rawData.total || 0
                  const valid = rawData.valid || 0
                  const lyrics = rawData.lyrics || 0
                  const totalCalls = total + lyrics
                  
                  return [
                    `${dataset.label}: ${totalCalls.toLocaleString()}회`,
                    `  전체 재생: ${total.toLocaleString()}회`,
                    `  가사 호출: ${lyrics.toLocaleString()}회`,
                    `  유효재생: ${valid.toLocaleString()}회`
                  ]
                },
                afterBody: function(context) {
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
  }, [data, colors])

  return (
    <div ref={containerRef} className="relative h-full min-w-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  )
}
