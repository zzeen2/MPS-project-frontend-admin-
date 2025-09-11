'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import SimpleLineChart from '@/components/charts/SimpleLineChart'

export default function ApiManagementPage() {
  const [pieTimeFilter, setPieTimeFilter] = useState<'24h' | '7d' | '30d'>('24h')
  const [trendTimeFilter, setTrendTimeFilter] = useState<'24h' | '7d' | '30d'>('24h')
  const [sortBy, setSortBy] = useState<'usage' | 'recent' | 'created'>('usage')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  
  // API 데이터 상태
  const [apiStats, setApiStats] = useState({
    musicCalls: 0,
    lyricsCalls: 0,
    totalCalls: 0,
    activeApiKeys: 0,
    musicCallsChange: 0,
    lyricsCallsChange: 0,
    totalCallsChange: 0,
    activeApiKeysChange: 0
  })

  const [pieChartData, setPieChartData] = useState({
    labels: [],
    musicCalls: [],
    lyricsCalls: []
  })
  
  const [trendChartData, setTrendChartData] = useState({
    labels: [],
    musicCalls: [],
    lyricsCalls: []
  })
  
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(false)

  // API 호출 함수들
  const fetchApiStats = async (period: string) => {
    try {
      const response = await fetch(`/admin/system/api/stats?period=${period}`)
      if (!response.ok) throw new Error('Failed to fetch API stats')
      const data = await response.json()
      setApiStats(data)
    } catch (error) {
      console.error('Error fetching API stats:', error)
    }
  }

  const fetchPieChartData = async (period: string) => {
    try {
      const response = await fetch(`/admin/system/api/chart?period=${period}`)
      if (!response.ok) throw new Error('Failed to fetch pie chart data')
      const data = await response.json()
      setPieChartData(data)
    } catch (error) {
      console.error('Error fetching pie chart data:', error)
    }
  }

  const fetchTrendChartData = async (period: string) => {
    try {
      const response = await fetch(`/admin/system/api/chart?period=${period}`)
      if (!response.ok) throw new Error('Failed to fetch trend chart data')
      const data = await response.json()
      setTrendChartData(data)
    } catch (error) {
      console.error('Error fetching trend chart data:', error)
    }
  }

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        sortBy,
        sortOrder
      })
      const response = await fetch(`/admin/system/api/keys?${params}`)
      if (!response.ok) throw new Error('Failed to fetch API keys')
      const data = await response.json()
      setApiKeys(data)
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  // useEffect로 데이터 로드
  useEffect(() => {
    fetchApiStats(pieTimeFilter)
    fetchPieChartData(pieTimeFilter)
    fetchTrendChartData(trendTimeFilter)
    fetchApiKeys()
  }, [pieTimeFilter, trendTimeFilter, sortBy, sortOrder, searchTerm])

  return (
    <div className="space-y-6">
      {/* KPI 카드와 차트를 같은 라인에 배치 */}
      <section className="mb-8">
        <div className="grid gap-5 [grid-template-columns:1fr_1.5fr] max-lg:grid-cols-1">
          {/* 파이차트 */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Title variant="card">API 호출 비율</Title>
              <div className="flex gap-2">
                {(['24h', '7d', '30d'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPieTimeFilter(filter)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      pieTimeFilter === filter
                        ? 'bg-teal-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {filter === '24h' ? '24시간' : filter === '7d' ? '7일' : '30일'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="w-48 h-48 relative">
                {/* 파이차트 SVG */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* 음원 호출 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40 * (apiStats.totalCalls > 0 ? apiStats.musicCalls / apiStats.totalCalls : 0)} ${2 * Math.PI * 40}`}
                    strokeDashoffset="0"
                  />
                  {/* 가사 호출 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40 * (apiStats.totalCalls > 0 ? apiStats.lyricsCalls / apiStats.totalCalls : 0)} ${2 * Math.PI * 40}`}
                    strokeDashoffset={`-${2 * Math.PI * 40 * (apiStats.totalCalls > 0 ? apiStats.musicCalls / apiStats.totalCalls : 0)}`}
                  />
                </svg>
                {/* 중앙 텍스트 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{apiStats.totalCalls.toLocaleString()}</div>
                    <div className="text-sm text-white/60">총 호출</div>
                  </div>
                </div>
              </div>
            </div>
            {/* 범례 */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-sm text-gray-400">음원 호출</span>
                <span className="text-sm text-teal-400 font-medium">
                  {apiStats.musicCalls.toLocaleString()}회 ({Math.round((apiStats.musicCalls / apiStats.totalCalls) * 100)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-400">가사 호출</span>
                <span className="text-sm text-blue-400 font-medium">
                  {apiStats.lyricsCalls.toLocaleString()}회 ({Math.round((apiStats.lyricsCalls / apiStats.totalCalls) * 100)}%)
                </span>
              </div>
            </div>
          </Card>

          {/* 차트 */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Title variant="card">API 호출량 추이</Title>
              <div className="flex gap-2">
                {(['24h', '7d', '30d'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTrendTimeFilter(filter)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      trendTimeFilter === filter
                        ? 'bg-teal-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {filter === '24h' ? '24시간' : filter === '7d' ? '7일' : '30일'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">
              <SimpleLineChart 
                labels={trendChartData.labels}
                series={[
                  { label: '음원 호출', data: trendChartData.musicCalls },
                  { label: '가사 호출', data: trendChartData.lyricsCalls }
                ]}
                colors={['#14b8a6', '#3b82f6']}
              />
            </div>
          </Card>
        </div>
      </section>

      {/* API 키 관리 테이블 */}
      <Card>
        <Title variant="card" className="mb-4">API 키 관리</Title>
        
        {/* 검색 및 정렬 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="min-w-[300px]">
              <input 
                className="w-full px-3 py-2 text-white placeholder-white/50 outline-none border border-white/10 rounded-lg focus:border-teal-400/50 transition-colors text-sm" 
                placeholder="기업명, API 키로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <div className="min-w-[120px]">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'usage' | 'recent' | 'created')}
                className="w-full px-3 py-2 text-white outline-none border border-white/10 rounded-lg focus:border-teal-400/50 transition-colors text-sm"
              >
                <option value="usage">사용량순</option>
                <option value="recent">최근사용순</option>
                <option value="created">생성일순</option>
              </select>
            </div>
            <div className="min-w-[100px]">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                className="w-full px-3 py-2 text-white outline-none border border-white/10 rounded-lg focus:border-teal-400/50 transition-colors text-sm"
              >
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-white/60">
            총 API 키: <span className="text-teal-300 font-semibold">45</span>개
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-center">
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/70 font-medium">기업 ID</th>
                  <th className="px-6 py-4 text-white/70 font-medium">기업명</th>
                  <th className="px-6 py-4 text-white/70 font-medium">API 키</th>
                  <th className="px-6 py-4 text-white/70 font-medium">생성일</th>
                  <th className="px-6 py-4 text-white/70 font-medium">마지막 사용</th>
                  <th className="px-6 py-4 text-white/70 font-medium">총 호출</th>
                  <th className="px-6 py-4 text-white/70 font-medium">음원 호출</th>
                  <th className="px-6 py-4 text-white/70 font-medium">가사 호출</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-white/60">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : apiKeys.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-white/60">
                      API 키가 없습니다.
                    </td>
                  </tr>
                ) : (
                  apiKeys.map((key: any, i: number) => (
                    <tr key={i} className={`border-b border-white/5 transition-all duration-200 ${
                      i % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                    } hover:bg-white/8`}>
                      <td className="px-6 py-4 text-white/80 text-center">{key.companyId}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="font-semibold text-white">{key.company}</div>
                      </td>
                      <td className="px-6 py-4 text-white/80 font-mono text-center">{key.key}</td>
                      <td className="px-6 py-4 text-white/80 text-center">{key.created}</td>
                      <td className="px-6 py-4 text-white/80 text-center">{key.lastUsed}</td>
                      <td className="px-6 py-4 text-white/80 text-center">{key.totalCalls.toLocaleString()}</td>
                      <td className="px-6 py-4 text-teal-400 text-center">{key.musicCalls.toLocaleString()}</td>
                      <td className="px-6 py-4 text-blue-400 text-center">{key.lyricsCalls.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
} 