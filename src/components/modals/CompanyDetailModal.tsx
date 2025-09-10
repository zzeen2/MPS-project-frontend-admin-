'use client'

import { useState } from 'react'
import SimpleLineChart from '@/components/charts/SimpleLineChart'

// 상세 타입 정의 추가
type CompanyRewardsDetail = {
  company: { id: number; name: string; tier: 'free'|'standard'|'business'; businessNumber?: string; contactEmail?: string; contactPhone?: string; homepageUrl?: string; profileImageUrl?: string; smartAccountAddress?: string; ceoName?: string; createdAt?: string; updatedAt?: string; subscriptionStart?: string; subscriptionEnd?: string }
  summary: { totalTokens: number; monthlyEarned: number; monthlyUsed: number; usageRate: number; activeTracks: number; yearMonth: string; earnedTotal?: number; usedTotal?: number }
  daily: Array<{ date: string; earned: number; used: number }>
  dailyIndustryAvg?: Array<{ date: string; earned: number }>
  monthly?: Array<{ yearMonth: string; earned: number }>
  monthlyIndustryAvg?: Array<{ yearMonth: string; earned: number }>
  byMusic: Array<{ musicId: number; title: string; artist: string; category: string | null; validPlays: number; earned: number }>
}

type Company = {
  id: string
  name: string
  tier: string
  totalTokens: number
  monthlyEarned: number
  monthlyUsed: number
  usageRate: number
  activeTracks: number
  status: 'active' | 'inactive' | 'suspended'
  lastActivity: string
  joinedDate: string
  contactEmail: string
  contactPhone: string
  businessNumber: string
  subscriptionStart: string
  subscriptionEnd: string
  monthlyUsage: number[]
  monthlyRewards: number[]
  topTracks: Array<{ title: string; usage: number; category: string }>
  // 추가 필드들
  ceoName: string
  profileImageUrl: string
  homepageUrl: string
  smartAccountAddress: string
  apiKeyHash: string
  createdAt: string
  updatedAt: string
}

type Props = {
  open: boolean
  onClose: () => void
  company: Company | null
  detail?: CompanyRewardsDetail | null
  loading?: boolean
  error?: string | null
  currentYearMonth?: string
  onChangeYearMonth?: (ym: string) => void
}

export default function CompanyDetailModal({ open, onClose, company, detail, loading, error, currentYearMonth, onChangeYearMonth }: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'usage'>('info')
  const [chartFilter, setChartFilter] = useState<'daily' | 'monthly'>('daily')

  if (!open || !company) return null

  // 상세 API의 company 정보를 우선 사용
  const info = (detail?.company as any) || company

  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  
  const usageData = {
    labels: months,
    series: [
      { label: '현재 기업', data: company.monthlyUsage },
      { label: '업계 평균', data: [1200, 1350, 1100, 1400, 1600, 1800, 2000, 1900, 2100, 1950, 2200, 2400] }
    ]
  }

  const rewardsData = {
    labels: months,
    datasets: [
      {
        label: '적립',
        data: company.monthlyRewards,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  // 리워드 관리 메인 테이블과 동일한 스타일로 통일
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Business': return 'bg-purple-500/20 text-purple-300'
      case 'Standard': return 'bg-blue-500/20 text-blue-300'
      case 'Free': return 'bg-gray-500/20 text-gray-300'
      default: return 'bg-white/10 text-white/80'
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
        <div className="w-full max-w-6xl h-[90vh] flex flex-col rounded-2xl bg-neutral-900 border border-white/10">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-white">{info.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg bg-white/10 p-2 text-white/60 hover:bg-white/20 hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex border-b border-white/10 flex-shrink-0">
            {[
              { id: 'info', label: '기업 기본 정보' },
              { id: 'usage', label: '리워드 현황' }
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
            {/* 기업 기본 정보 */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-white/10 p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-4 w-1.5 rounded bg-teal-300" />
                      <div className="text-lg font-semibold">기업 기본 정보</div>
                    </div>
                    <div className="flex gap-8 items-start">
                      {/* 회사 이미지 */}
                      <div className="flex-shrink-0">
                        <div className="w-64 h-64 rounded-lg border border-white/10 overflow-hidden bg-white/5">
                          {info.profileImageUrl ? (
                            <img 
                              src={info.profileImageUrl} 
                              alt={`${info.name} 로고`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.nextElementSibling) {
                                  target.nextElementSibling.classList.remove('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${info.profileImageUrl ? 'hidden' : ''}`}>
                            <div className="text-center">
                              <svg className="w-20 h-20 mx-auto text-white/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <div className="text-xs text-white/40">회사 이미지</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* 기업 정보 */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                          <div>
                            <div className="text-white/60 mb-1">기업명</div>
                            <div className="text-white font-medium">{info.name}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">등급</div>
                            <div className="text-white font-medium">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getTierColor(info.tier)}`}>
                                {info.tier}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">대표자명</div>
                            <div className="text-white font-medium">{info.ceoName || '-'}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">사업자 번호</div>
                            <div className="text-white font-medium">{info.businessNumber || '-'}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">이메일</div>
                            <div className="text-white font-medium">{info.contactEmail || '-'}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">전화번호</div>
                            <div className="text-white font-medium">{info.contactPhone || '-'}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">홈페이지</div>
                            <div className="text-white font-medium">
                              {info.homepageUrl ? (
                                <a href={info.homepageUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline">
                                  {info.homepageUrl}
                                </a>
                              ) : (
                                <span className="text-white/40">-</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">스마트어카운트</div>
                            <div className="text-white font-medium font-mono text-xs">
                              {info.smartAccountAddress ? (
                                <span className="text-teal-400">
                                  {String(info.smartAccountAddress).slice(0, 8)}...{String(info.smartAccountAddress).slice(-6)}
                                </span>
                              ) : (
                                <span className="text-white/40">-</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">가입일</div>
                            <div className="text-white font-medium">{info.createdAt || '-'}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">수정일</div>
                            <div className="text-white font-medium">{info.updatedAt || '-'}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">구독 시작일</div>
                            <div className="text-white font-medium">{info.subscriptionStart || '-'}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">구독 종료일</div>
                            <div className="text-white font-medium">{info.subscriptionEnd || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 리워드 지표 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-4 w-1.5 rounded bg-teal-300" />
                      <div className="text-lg font-semibold">리워드 지표</div>
                    </div>
                    {detail && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {(() => {
                          const totalTokens = Number(detail.summary.totalTokens || 0)
                          const totalRate = Number(detail.summary.usageRate || 0)
                          const monthEarned = Number(detail.summary.monthlyEarned || 0)
                          const monthUsed = Number(detail.summary.monthlyUsed || 0)
                          const earnedTotal = Number((detail.summary as any).earnedTotal || 0)
                          const usedTotal = Number((detail.summary as any).usedTotal || 0)
                          const sumEarned = earnedTotal
                          const sumUsed = usedTotal
                          const now = new Date()
                          const kst = new Date(now.getTime() + 9 * 3600 * 1000)
                          const ymNow = `${kst.getUTCFullYear()}-${String(kst.getUTCMonth()+1).padStart(2,'0')}`
                          const isCurrentMonth = detail.summary.yearMonth === ymNow
                          const elapsedDays = isCurrentMonth ? Math.min(kst.getUTCDate(), (detail.daily || []).length || 30) : ((detail.daily || []).length || 30)
                          const avgEarned = elapsedDays > 0 ? (monthEarned / elapsedDays) : 0
                          return (
                            <>
                              <div>
                                <div className="text-white/60 mb-1">보유 토큰</div>
                                <div className="text-teal-400 font-medium">{totalTokens.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-white/60 mb-1">누적 사용률</div>
                                <div className="text-white font-medium">{totalRate}%</div>
                              </div>
                              <div>
                                <div className="text-white/60 mb-1">이번 달 적립</div>
                                <div className="text-teal-400 font-medium">{monthEarned.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-white/60 mb-1">이번 달 사용</div>
                                <div className="text-white font-medium">{monthUsed.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-white/60 mb-1">일평균 적립</div>
                                <div className="text-white font-medium">{avgEarned.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-white/60 mb-1">누적 적립</div>
                                <div className="text-white font-medium">{sumEarned.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-white/60 mb-1">누적 사용</div>
                                <div className="text-white font-medium">{sumUsed.toLocaleString()}</div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 음원 사용 현황 탭 */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                {/* 리워드 적립 추이 차트 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                      <span className="h-4 w-1.5 rounded bg-teal-300"></span>
                      리워드 적립 추이
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setChartFilter('daily')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          chartFilter === 'daily'
                            ? 'bg-teal-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                        }`}
                      >
                        일별
                      </button>
                      <button
                        onClick={() => setChartFilter('monthly')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          chartFilter === 'monthly'
                            ? 'bg-teal-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                        }`}
                      >
                        월별
                      </button>
                    </div>
                  </div>
                  <div className="h-64">
                    {detail ? (
                      chartFilter === 'daily' ? (
                        <SimpleLineChart 
                          labels={(detail.daily || []).map(item => {
                            const date = new Date(item.date)
                            return `${date.getMonth() + 1}/${date.getDate()}`
                          })}
                          series={[
                            { label: '현재 기업', data: (detail.daily || []).map(item => item.earned) },
                            { label: '업계 평균', data: (detail.dailyIndustryAvg || []).map(item => item.earned) },
                          ]}
                          colors={["#14b8a6", "#9ca3af"]}
                        />
                      ) : (
                        <SimpleLineChart 
                          labels={(detail.monthly || []).map(m => {
                            const [y, mm] = m.yearMonth.split('-')
                            return `${y}/${Number(mm)}`
                          })}
                          series={[
                            { label: '현재 기업', data: (detail.monthly || []).map(m => m.earned) },
                            { label: '업계 평균', data: (detail.monthlyIndustryAvg || []).map(m => m.earned) },
                          ]}
                          colors={["#14b8a6", "#9ca3af"]}
                        />
                      )
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/60">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <div className="text-sm">데이터가 없습니다</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 전체 음원 사용 현황 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                      <span className="h-4 w-1.5 rounded bg-teal-300"></span>
                      전체 음원 사용 현황
                    </h3>
                    <select 
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
                      value={(() => {
                        const ym = currentYearMonth || detail?.summary.yearMonth
                        if (!ym) return ''
                        const [, mm] = ym.split('-')
                        return String(Number(mm))
                      })()}
                      onChange={(e) => {
                        const m = Number(e.target.value)
                        const baseYm = currentYearMonth || detail?.summary.yearMonth
                        const year = baseYm ? baseYm.split('-')[0] : String(new Date().getFullYear())
                        const nextYm = `${year}-${String(m).padStart(2, '0')}`
                        onChangeYearMonth?.(nextYm)
                      }}
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map((m)=> (
                        <option key={m} value={m}>{m}월</option>
                      ))}
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left">
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-white/80 font-medium text-center">순위</th>
                          <th className="px-4 py-3 text-white/80 font-medium text-center">음원명</th>
                          <th className="px-4 py-3 text-white/80 font-medium text-center">카테고리</th>
                          <th className="px-4 py-3 text-white/80 font-medium text-center">리워드 발생 음원 호출</th>
                          <th className="px-4 py-3 text-white/80 font-medium text-center">리워드 발생 가사 호출</th>
                          <th className="px-4 py-3 text-white/80 font-medium text-center">적립 리워드</th>
                          <th className="px-4 py-3 text-white/80 font-medium text-center">최근 사용</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detail?.byMusic || []).map((row, index) => (
                          <tr key={row.musicId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm font-bold ${
                                index === 0 ? 'text-teal-400' : index === 1 ? 'text-teal-400' : index === 2 ? 'text-teal-400' : 'text-white'
                              }`}>{index + 1}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="font-medium text-white truncate max-w-[200px]" title={row.title}>{row.title}</div>
                              <div className="text-white/60 text-xs truncate max-w-[200px]" title={row.artist}>· {row.artist}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                                {row.category ?? '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-teal-400 font-medium text-center">{(row as any).musicCalls || 0}</td>
                            <td className="px-4 py-3 text-teal-400 font-medium text-center">{(row as any).lyricsCalls || 0}</td>
                            <td className="px-4 py-3 text-teal-400 font-medium text-center">{row.earned.toLocaleString()}</td>
                            <td className="px-4 py-3 text-white/60 text-xs text-center">{(row as any).lastUsedAt || '-'}</td>
                          </tr>
                        ))}
                        {(!detail?.byMusic || detail.byMusic.length === 0) && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-white/50">데이터가 없습니다</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 