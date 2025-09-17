'use client'
import { useEffect, useRef } from 'react'
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Tooltip)

export interface PieItem {
    label: string
    value: number
}

type Props = {
    items: PieItem[]
    colors?: string[]
}

const DEFAULT_COLORS = [
    '#10b981', '#60a5fa', '#f59e0b', '#f87171', '#a78bfa', '#34d399', '#fb7185', '#22d3ee', '#fbbf24', '#93c5fd',
]

export default function PieCompanyDistribution({ items, colors = DEFAULT_COLORS }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const chartRef = useRef<Chart | null>(null)

    useEffect(() => {
        if (!canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')!

        const labels = items.map(i => i.label)
        const data = items.map(i => i.value)
        const bg = items.map((_, idx) => colors[idx % colors.length])

        if (chartRef.current) {
            chartRef.current.destroy()
            chartRef.current = null
        }

        chartRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: bg,
                        borderColor: 'rgba(0,0,0,0.6)',
                        borderWidth: 2,
                        hoverOffset: 8,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const label = (ctx.label ?? '') as string
                                const val = Number(ctx.raw ?? 0)
                                const total = (ctx.dataset?.data as number[]).reduce((s, v) => s + Number(v || 0), 0)
                                const pct = total > 0 ? Math.round((val / total) * 1000) / 10 : 0
                                return `${label}: ${val.toLocaleString()} 토큰 (${pct}%)`
                            },
                        },
                    },
                    legend: { display: false },
                },
                cutout: '55%',
            },
        })

        return () => chartRef.current?.destroy()
    }, [items, colors])

    return <canvas ref={canvasRef} className="h-[260px] w-full" />
}
