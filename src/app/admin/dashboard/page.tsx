'use client'

import { useEffect, useState } from 'react'
import DashboardHeader from '@/components/layout/DashboardHeader'
import CompanyTotalCard from '@/components/cards/CompanyTotalCard'
import TrackTotalCard from '@/components/cards/TrackTotalCard'
import MonthlyPlaysCard from '@/components/cards/MonthlyPlaysCard'
import MonthlyRevenueCard from '@/components/cards/MonthlyRevenueCard'
import RewardsStatusCard from '@/components/cards/RewardsStatusCard'
import RenewalRateCard from '@/components/cards/RenewalRateCard'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import DetailedLineChart from '@/components/charts/DetailedLineChart'
import BarCategoryTop5 from '@/components/charts/BarCategoryTop5'
import PieTierDistribution from '@/components/charts/PieTierDistribution'

type HourlyData = {
  hour: string
  free: { total: number; valid: number; lyrics: number }
  standard: { total: number; valid: number; lyrics: number }
  business: { total: number; valid: number; lyrics: number }
  prevAvg: number
}

export default function DashboardPage() {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [hourlyLoading, setHourlyLoading] = useState(false)
  const [hourlyError, setHourlyError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [topTracks, setTopTracks] = useState<Array<{ rank: number; validPlays: number; totalPlays: number }>>(
    Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, validPlays: 0, totalPlays: 0 }))
  )
  const [realtimeApiStatus, setRealtimeApiStatus] = useState<Array<{ 
    status: string; 
    endpoint: string; 
    callType: string;
    validity: string;
    company: string; 
    timestamp: string 
  }>>([
    { status: 'success', endpoint: '/api/music/play', callType: '음원 호출', validity: '유효재생', company: 'Digital Media Inc', timestamp: '17:44:40' },
    { status: 'success', endpoint: '/api/lyrics/get', callType: '가사 호출', validity: '유효재생', company: 'TechCorp Solutions', timestamp: '17:36:07' },
    { status: 'error', endpoint: '/api/music/play', callType: '음원 호출', validity: '무효재생', company: 'Startup Ventures', timestamp: '17:28:42' },
    { status: 'success', endpoint: '/api/lyrics/get', callType: '가사 호출', validity: '유효재생', company: 'Creative Agency', timestamp: '17:10:28' },
    { status: 'success', endpoint: '/api/music/play', callType: '음원 호출', validity: '유효재생', company: 'Media Corp', timestamp: '17:08:44' }
  ])
  const [apiStatusFilter, setApiStatusFilter] = useState<'all' | 'music' | 'lyrics'>('all')
  const [realtimeTopTracks, setRealtimeTopTracks] = useState<Array<{ 
    rank: number; 
    title: string; 
    validPlays: number; 
  }>>([
    { rank: 1, title: 'Love Story', validPlays: 1250 },
    { rank: 2, title: 'Summer Nights', validPlays: 980 },
    { rank: 3, title: 'City Lights', validPlays: 850 },
    { rank: 4, title: 'Ocean Waves', validPlays: 720 },
    { rank: 5, title: 'Mountain Peak', validPlays: 650 },
    { rank: 6, title: 'Forest Path', validPlays: 580 },
    { rank: 7, title: 'River Flow', validPlays: 520 },
    { rank: 8, title: 'Sky High', validPlays: 480 },
    { rank: 9, title: 'Deep Blue', validPlays: 420 },
    { rank: 10, title: 'Golden Hour', validPlays: 380 }
  ])

  useEffect(() => {
    // 마지막 업데이트 시간
    const updateTime = () => {
      const now = new Date()
      const s = now.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setLastUpdated(s)
    }
    const fetchHourly = async () => {
      try {
        setHourlyLoading(true)
        setHourlyError(null)
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
        const res = await fetch(`${baseUrl}/admin/companies/stats/hourly-plays`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const j = await res.json()
        const data = (j.labels || []).map((label: string, i: number) => ({
          hour: label,
          free: j.free?.[i] ?? { total: 0, valid: 0, lyrics: 0 },
          standard: j.standard?.[i] ?? { total: 0, valid: 0, lyrics: 0 },
          business: j.business?.[i] ?? { total: 0, valid: 0, lyrics: 0 },
          prevAvg: j.prevAvg?.[i] ?? 0,
        }))
        setHourlyData(data)
      } catch (e: any) {
        setHourlyError(e.message || '조회 실패')
        setHourlyData([])
      } finally {
        setHourlyLoading(false)
      }
    }


    const fetchRealtimeData = async () => {
      try {
        console.log('Fetching realtime data...')
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
        const [apiRes, tracksRes] = await Promise.all([
          fetch(`${baseUrl}/admin/musics/realtime/api-status`),
          fetch(`${baseUrl}/admin/musics/realtime/top-tracks`)
        ])
        
        console.log('API responses:', {
          apiStatus: apiRes.status,
          topTracks: tracksRes.status
        })
        
        if (apiRes.ok) {
          const apiData = await apiRes.json()
          console.log('API Status Data:', apiData)
          // 백엔드에서 callType과 validity가 없을 때 기본값 설정
          const items = (apiData.items || []).map((item: any) => ({
            ...item,
            callType: item.callType || (item.endpoint?.includes('lyrics') ? '가사 호출' : '음원 호출'),
            validity: item.validity || '유효재생'
          }))
          setRealtimeApiStatus(items)
        } else {
          console.error('API Status failed:', apiRes.status)
        }
        
        if (tracksRes.ok) {
          const tracksData = await tracksRes.json()
          console.log('Top Tracks Data:', tracksData)
          setRealtimeTopTracks(tracksData.items || [])
        } else {
          console.error('Top Tracks failed:', tracksRes.status)
        }
        
      } catch (e) {
        console.error('실시간 데이터 조회 실패:', e)
      }
    }

    fetchHourly()
    fetchRealtimeData()
    updateTime()

    const interval = setInterval(() => {
      fetchHourly()
      fetchRealtimeData()
      updateTime()
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full px-6 py-6">
      <DashboardHeader 
        title="MPS - Music Performance Statistics" 
        subtitle="메인 대시보드"
        lastUpdated={lastUpdated}
      />

      <section className="mb-8">
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <TrackTotalCard />
          <CompanyTotalCard />
          <MonthlyPlaysCard />
          <MonthlyRevenueCard />
          <RewardsStatusCard />
          <RenewalRateCard />
        </div>
      </section>

      <section className="mb-8">
        <Title variant="section" className="mb-4">차트 분석</Title>
        <div className="grid gap-5 [grid-template-columns:1.5fr_1fr_0.8fr] max-[1200px]:grid-cols-2 max-md:grid-cols-1">
          <Card>
            <Title variant="card" className="mb-4">24시간 API 호출 현황 (전체 재생+가사 호출)</Title>
            <div className="h-80">
              <DetailedLineChart 
                data={hourlyData}
                colors={['#10b981', '#8b5cf6', '#3b82f6']}
              />
            </div>
          </Card>
          <Card>
            <Title variant="card" className="mb-4">등급별 기업 분포</Title>
            <div className="h-80">
              <PieTierDistribution />
            </div>
          </Card>
          <Card>
            <Title variant="card" className="mb-4">카테고리 Top5 유효재생</Title>
            <div className="h-80">
              <BarCategoryTop5 />
            </div>
          </Card>
        </div>
      </section>

      <section className="mb-8">
        <Title variant="section" className="mb-4">실시간 모니터링</Title>
        <div className="grid gap-5 [grid-template-columns:2fr_1fr] max-[1200px]:grid-cols-1">
          {/* 실시간 API 호출 */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <Title variant="card">실시간 API 호출</Title>
              <div className="flex gap-2">
                <button
                  onClick={() => setApiStatusFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    apiStatusFilter === 'all' 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setApiStatusFilter('music')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    apiStatusFilter === 'music' 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  음원 호출
                </button>
                <button
                  onClick={() => setApiStatusFilter('lyrics')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    apiStatusFilter === 'lyrics' 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  가사 호출
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">성공여부</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">유형</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">유효재생</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">엔드포인트</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">기업</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">시간</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {realtimeApiStatus.length > 0 ? (
                    realtimeApiStatus
                      .filter(item => {
                        if (apiStatusFilter === 'all') return true
                        if (apiStatusFilter === 'music') return item.callType === '음원 호출'
                        if (apiStatusFilter === 'lyrics') return item.callType === '가사 호출'
                        return true
                      })
                      .map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-2 px-3">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            item.status === 'success' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${
                              item.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                            {item.status === 'success' ? '성공' : '실패'}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-white/80">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.callType === '음원 호출' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {item.callType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-white/80">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.validity === '유효재생' 
                              ? 'bg-teal-500/20 text-teal-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {item.validity}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-white/60 font-mono text-xs">{item.endpoint}</td>
                        <td className="py-2 px-3 text-white/60">{item.company}</td>
                        <td className="py-2 px-3 text-white/40">{item.timestamp}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 px-3 text-center text-white/40">데이터를 불러오는 중...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 인기 음원 TOP 10 */}
          <Card>
            <div className="mb-4">
              <Title variant="card">인기 음원 TOP 10</Title>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">순위</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">음원명</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">24시 유효재생</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {realtimeTopTracks.length > 0 ? (
                    realtimeTopTracks.map(({ rank, title, validPlays }) => (
                      <tr key={rank} className="border-b border-white/5">
                        <td className={`py-2 px-3 font-medium ${rank <= 3 ? 'text-teal-300' : 'text-white/60'}`}>{rank}</td>
                        <td className="py-2 px-3 text-white/80">{title}</td>
                        <td className="py-2 px-3 text-white/60">{validPlays.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 px-3 text-center text-white/40">데이터를 불러오는 중...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      </section>

    </div>
  )
}