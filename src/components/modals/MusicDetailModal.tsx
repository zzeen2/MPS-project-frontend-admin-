'use client'

import { useEffect, useState } from 'react'
import SimpleLineChart from '@/components/charts/SimpleLineChart'

type Music = {
  id: string
  title: string
  category: string
  monthlyUsed: number
  monthlyLimit: number | null
  companies: number
  rewardPerPlay: number
  status: 'active' | 'inactive'
  monthlyUsage: number[]
  monthlyRewards: number[]
  topCompanies: Array<{ name: string; usage: number; tier: string }>
  totalRewards: number
  totalPlays: number
  averageRating: number
  releaseDate: string
  duration: number // 초 단위로 변경
  artist: string
  musicType: '일반' | 'Inst' // 음원 유형 추가
}

type Props = {
  open: boolean
  onClose: () => void
  music: Music | null
}

export default function MusicDetailModal({ open, onClose, music }: Props) {
  const [activeTab, setActiveTab] = useState<'usage' | 'rewards'>('usage')
  const [musicGranularity, setMusicGranularity] = useState<'monthly' | 'daily'>('monthly')
  const [lyricsGranularity, setLyricsGranularity] = useState<'monthly' | 'daily'>('monthly')
  const [musicTrend, setMusicTrend] = useState<{ labels: string[]; series: Array<{ label: string; data: number[] }> } | null>(null)
  const [lyricsTrend, setLyricsTrend] = useState<{ labels: string[]; series: Array<{ label: string; data: number[] }> } | null>(null)
  const [musicLoading, setMusicLoading] = useState(false)
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [musicError, setMusicError] = useState<string | null>(null)
  const [lyricsError, setLyricsError] = useState<string | null>(null)
  const [companyLoading, setCompanyLoading] = useState(false)
  const [companyError, setCompanyError] = useState<string | null>(null)
  const [companyItems, setCompanyItems] = useState<Array<{
    rank: number
    companyId: number
    companyName: string
    tier: 'Free' | 'Standard' | 'Business'
    monthlyEarned: number
    monthlyPlays: number
  }> | null>(null)
  const [companyTotal, setCompanyTotal] = useState(0)
  const [companyPage] = useState(1)
  const [companyLimit] = useState(1000)
  const [monthlyLoading, setMonthlyLoading] = useState(false)
  const [monthlyError, setMonthlyError] = useState<string | null>(null)
  const [monthlyItems, setMonthlyItems] = useState<Array<{
    label: string
    validPlays: number
    companiesUsing: number
    monthlyLimit: number | null
    usageRate: number | null
    earned: number
    rewardPerPlay: number | null
  }> | null>(null)

  if (!open || !music) return null

  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

  // 이번 달(KST) 기준 일수와 인덱스 계산 (일별 조회 기본값)
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 3600 * 1000)
  const currentMonthIndex = kst.getUTCMonth() // 0-11
  const year = kst.getUTCFullYear()
  const month = currentMonthIndex + 1
  const daysInMonth = new Date(year, month, 0).getDate()
  const dailyLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`)
  const defaultYearMonth = `${year}-${String(month).padStart(2, '0')}`

  // 월별 리워드 현황 API 페칭
  useEffect(() => {
    if (!open || !music) return
    let aborted = false
    const fetchMonthly = async () => {
      try {
        setMonthlyLoading(true)
        setMonthlyError(null)
        const params = new URLSearchParams()
        params.set('endYearMonth', defaultYearMonth)
        params.set('months', '12')
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/${music.id}/rewards/monthly?` + params.toString()
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (aborted) return
        const items = Array.isArray(data.items) ? data.items.map((it: any) => ({
          label: String(it.label ?? ''),
          validPlays: Number(it.validPlays ?? it.valid_plays ?? 0),
          companiesUsing: Number(it.companiesUsing ?? it.companies_using ?? 0),
          monthlyLimit: it.monthlyLimit ?? it.monthly_limit ?? null,
          usageRate: it.usageRate ?? it.usage_rate ?? null,
          earned: Number(it.earned ?? 0),
          rewardPerPlay: it.rewardPerPlay ?? it.reward_per_play ?? null,
        })) : []
        setMonthlyItems(items)
      } catch (e: any) {
        if (aborted) return
        setMonthlyError(e.message || '조회 실패')
        setMonthlyItems([])
      } finally {
        if (!aborted) setMonthlyLoading(false)
      }
    }
    fetchMonthly()
    return () => { aborted = true }
  }, [open, music?.id, defaultYearMonth])

  // 트렌드 API 페칭 함수
  useEffect(() => {
    if (!open || !music) return
    let aborted = false
    const fetchTrend = async (kind: 'music' | 'lyrics', granularity: 'daily' | 'monthly') => {
      const setLoading = kind === 'music' ? setMusicLoading : setLyricsLoading
      const setErr = kind === 'music' ? setMusicError : setLyricsError
      const setData = kind === 'music' ? setMusicTrend : setLyricsTrend
      try {
        setLoading(true)
        setErr(null)
        const params = new URLSearchParams()
        params.set('granularity', granularity)
        params.set('type', kind)
        params.set('segment', 'all')
        if (granularity === 'daily') params.set('yearMonth', defaultYearMonth)
        else params.set('months', '12')
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/${music.id}/rewards/trend?` + params.toString()
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (aborted) return
        setData({ labels: data.labels || [], series: data.series || [] })
      } catch (e: any) {
        if (aborted) return
        setErr(e.message || '조회 실패')
        setData({ labels: [], series: [] })
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    // 병렬 호출
    fetchTrend('music', musicGranularity)
    fetchTrend('lyrics', lyricsGranularity)
    return () => { aborted = true }
  }, [open, music?.id, musicGranularity, lyricsGranularity])

  // 사용 기업 현황 API 페칭
  useEffect(() => {
    if (!open || !music || activeTab !== 'rewards') return
    let aborted = false
    const fetchCompanies = async () => {
      try {
        setCompanyLoading(true)
        setCompanyError(null)
        const params = new URLSearchParams()
        params.set('yearMonth', defaultYearMonth)
        params.set('page', '1')
        params.set('limit', '1000')
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/${music.id}/rewards/companies?` + params.toString()
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (aborted) return
        const items = Array.isArray(data.items) ? data.items.map((it: any) => ({
          rank: Number(it.rank ?? 0),
          companyId: Number(it.companyId ?? it.company_id ?? 0),
          companyName: String(it.companyName ?? it.company_name ?? ''),
          tier: (it.tier ?? 'Free') as any,
          monthlyEarned: Number(it.monthlyEarned ?? it.monthly_earned ?? 0),
          monthlyPlays: Number(it.monthlyPlays ?? it.monthly_plays ?? 0),
        })) : []
        setCompanyItems(items)
        setCompanyTotal(Number(data.total ?? 0))
      } catch (e: any) {
        if (aborted) return
        setCompanyError(e.message || '조회 실패')
        setCompanyItems([])
        setCompanyTotal(0)
      } finally {
        if (!aborted) setCompanyLoading(false)
      }
    }
    fetchCompanies()
    return () => { aborted = true }
  }, [open, music?.id, activeTab, defaultYearMonth])

  const rewardsData = {
    labels: months,
    series: [
      { label: '현재 음원', data: music.monthlyRewards },
      { label: '업계 평균', data: [5000, 6000, 7000, 8000, 9000, 10000, 11000, 10500, 12000, 11500, 13000, 14000] }
    ]
  }

  const getCategoryColor = (category: string) => {
    const colors = [
      { bg: 'from-purple-400/15 to-purple-500/15', text: 'text-purple-300', border: 'border-purple-400/25' },
      { bg: 'from-blue-400/15 to-blue-500/15', text: 'text-blue-300', border: 'border-blue-400/25' },
      { bg: 'from-teal-400/15 to-teal-500/15', text: 'text-teal-300', border: 'border-teal-400/25' },
      { bg: 'from-green-400/15 to-green-500/15', text: 'text-green-300', border: 'border-green-400/25' },
      { bg: 'from-yellow-400/15 to-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-400/25' },
      { bg: 'from-orange-400/15 to-orange-500/15', text: 'text-orange-300', border: 'border-orange-400/25' },
      { bg: 'from-red-400/15 to-red-500/15', text: 'text-red-300', border: 'border-red-400/25' },
      { bg: 'from-pink-400/15 to-pink-500/15', text: 'text-pink-300', border: 'border-pink-400/25' },
      { bg: 'from-indigo-400/15 to-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-400/25' },
      { bg: 'from-cyan-400/15 to-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-400/25' }
    ]

    let hash = 0
    for (let i = 0; i < category.length; i++) {
      const char = category.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }

    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400'
      case 'inactive': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <>
      {/* 커스텀 스크롤바 스타일 */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-6xl h-[90vh] flex flex-col rounded-xl bg-neutral-900 border border-white/10 shadow-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {music.title}
                <span className="text-white/50 font-normal"> · </span>
                <span className="text-white/70 font-medium">{music.artist}</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex border-b border-white/10 flex-shrink-0">
                          {[
                { id: 'usage', label: '리워드 발생 현황' },
                { id: 'rewards', label: '사용 기업 현황' }
              ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'text-teal-400 border-teal-400'
                    : 'text-white/60 border-transparent hover:text-white/80 hover:border-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* 기본 정보 섹션 제거 */}

            {/* 사용 현황 탭 */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                {/* 월별 API 사용량 차트: 음악/가사 분리 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                        <div className="w-1 h-6 bg-teal-400 rounded-full"></div>
                        음악 호출 추이
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setMusicGranularity('daily')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                            musicGranularity === 'daily'
                              ? 'bg-teal-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                          }`}
                        >
                          일별
                        </button>
                        <button
                          onClick={() => setMusicGranularity('monthly')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                            musicGranularity === 'monthly'
                              ? 'bg-teal-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                          }`}
                        >
                          월별
                        </button>
                      </div>
                    </div>
                    <div className="h-64">
                      {musicLoading ? (
                        <div className="h-full flex items-center justify-center text-white/60">로딩중...</div>
                      ) : musicTrend && musicTrend.labels.length > 0 ? (
                        <SimpleLineChart 
                          labels={musicTrend.labels.map(l => {
                            if (musicGranularity === 'daily') {
                              const d = new Date(l)
                              return `${d.getMonth()+1}/${d.getDate()}`
                            }
                            const [y, mm] = l.split('-')
                            return `${y}/${Number(mm)}`
                          })}
                          series={musicTrend.series}
                          colors={['#14b8a6', '#9ca3af']}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-white/60">데이터가 없습니다</div>
                      )}
                    </div>
                  </div>
                <div className="rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                    <div className="w-1 h-6 bg-teal-400 rounded-full"></div>
                        가사 호출 추이
                  </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setLyricsGranularity('daily')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                            lyricsGranularity === 'daily'
                              ? 'bg-teal-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                          }`}
                        >
                          일별
                        </button>
                        <button
                          onClick={() => setLyricsGranularity('monthly')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                            lyricsGranularity === 'monthly'
                              ? 'bg-teal-500 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                          }`}
                        >
                          월별
                        </button>
                      </div>
                    </div>
                  <div className="h-64">
                      {lyricsLoading ? (
                        <div className="h-full flex items-center justify-center text-white/60">로딩중...</div>
                      ) : lyricsTrend && lyricsTrend.labels.length > 0 ? (
                    <SimpleLineChart 
                          labels={lyricsTrend.labels.map(l => {
                            if (lyricsGranularity === 'daily') {
                              const d = new Date(l)
                              return `${d.getMonth()+1}/${d.getDate()}`
                            }
                            const [y, mm] = l.split('-')
                            return `${y}/${Number(mm)}`
                          })}
                          series={lyricsTrend.series}
                      colors={['#14b8a6', '#9ca3af']}
                    />
                      ) : (
                        <div className="h-full flex items-center justify-center text-white/60">데이터가 없습니다</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 월별 사용 상세 현황 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-1 h-6 bg-teal-400 rounded-full"></div>
                    월별 리워드 발생 현황
                  </h3>
                  <div className="overflow-x-auto">
                    {monthlyLoading ? (
                      <div className="py-10 text-center text-white/60">로딩중...</div>
                    ) : monthlyError ? (
                      <div className="py-10 text-center text-red-400">{monthlyError}</div>
                    ) : monthlyItems && monthlyItems.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead className="text-center">
                          <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-white/80 font-medium text-center">월</th>
                            <th className="px-6 py-4 text-white/80 font-medium text-center">유효재생수</th>
                            <th className="px-6 py-4 text-white/80 font-medium text-center">사용 기업</th>
                            <th className="px-6 py-4 text-white/80 font-medium text-center">월 한도</th>
                            <th className="px-6 py-4 text-white/80 font-medium text-center">사용률</th>
                            <th className="px-6 py-4 text-white/80 font-medium text-center">월 리워드 지급액</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyItems.map((it) => {
                            const monthlyLimit = typeof it.monthlyLimit === 'number' && isFinite(it.monthlyLimit) ? it.monthlyLimit : null
                            const usageRate = monthlyLimit !== null && typeof it.usageRate === 'number' && isFinite(it.usageRate) ? Math.min(it.usageRate, 100) : null
                            const earned = typeof it.earned === 'number' && isFinite(it.earned) ? it.earned : 0
                            return (
                              <tr key={it.label} className="border-b border-white/5">
                                <td className="px-6 py-4 font-medium text-white text-center">{it.label}</td>
                                <td className="px-6 py-4 text-teal-400 font-medium text-center">{it.validPlays.toLocaleString()}</td>
                                <td className="px-6 py-4 text-white/80 text-center">{it.companiesUsing.toLocaleString()}개</td>
                                <td className="px-6 py-4 text-white/80 text-center">{monthlyLimit !== null ? monthlyLimit.toLocaleString() : '-'}</td>
                                <td className="px-6 py-4 text-white/80 text-center">
                                  {monthlyLimit !== null && usageRate !== null ? (
                                    <div className="flex items-center justify-center gap-3">
                                      <div className="w-20 bg-white/10 rounded-full h-1.5">
                                        <div
                                          className="bg-gradient-to-r from-teal-400 to-blue-400 h-1.5 rounded-full transition-all duration-300"
                                          style={{ width: `${Math.min(usageRate, 100)}%` }}
                                        />
                                      </div>
                                      <span className={`text-xs font-medium ${usageRate > 100 ? 'text-teal-300' : 'text-white/70'}`}>
                                        {usageRate > 100 ? '100%' : `${Math.round(usageRate)}%`}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-white/40 text-xs">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-teal-400 font-medium text-center">{earned.toLocaleString()} 토큰</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-10 text-center text-white/60">데이터가 없습니다</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 기업별 리워드 적립 현황 탭 복원 */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                {/* 사용 기업 현황 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                      <div className="w-1 h-6 bg-teal-400 rounded-full"></div>
                      월별 사용 기업 현황
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm">{defaultYearMonth}</span>
                    </div>
                  </div>
                  
                  {/* 선택된 월의 모든 사용 기업 테이블 */}
                  <div className="overflow-x-auto">
                    {companyLoading ? (
                      <div className="py-10 text-center text-white/60">로딩중...</div>
                    ) : companyError ? (
                      <div className="py-10 text-center text-red-400">{companyError}</div>
                    ) : companyItems && companyItems.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead className="text-center">
                          <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-white/80 font-medium text-center">순위</th>
                            <th className="px-6 py-4 text-white/80 font-medium text-center">기업명</th>
                            <th className="px-6 py-4 text-white/80 font-medium text-center">등급</th>
                            <th className="px-6 py-4 text-white/80 font-medium text-center">월 리워드 적립</th>
                            <th className="px-6 py-4 text-white/80 font-medium text-center">유효 재생수</th>
                          </tr>
                        </thead>
                        <tbody>
                          {companyItems.map((item) => (
                            <tr key={`${item.companyId}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 text-center">
                                <span className={`text-sm font-bold ${item.rank <= 3 ? 'text-teal-400' : 'text-white'}`}>{item.rank}</span>
                              </td>
                              <td className="px-6 py-4 font-medium text-white text-center">{item.companyName}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  item.tier === 'Business' ? 'bg-gradient-to-r from-purple-400/15 to-purple-500/15 text-purple-300 border border-purple-400/25' :
                                  item.tier === 'Standard' ? 'bg-gradient-to-r from-blue-400/15 to-blue-500/15 text-blue-300 border border-blue-400/25' :
                                  'bg-gradient-to-r from-gray-400/15 to-gray-500/15 text-gray-300 border border-gray-400/25'
                                }`}>
                                  {item.tier}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-teal-400 font-medium text-center">{item.monthlyEarned.toLocaleString()} 토큰</td>
                              <td className="px-6 py-4 text-white/80 font-medium text-center">{item.monthlyPlays.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-10 text-center text-white/60">데이터가 없습니다</div>
                    )}
                  </div>
                  {/* 스크롤 처리로 페이징 제거 */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 