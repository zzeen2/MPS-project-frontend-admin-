'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import BarCategoryTop5 from '@/components/charts/BarCategoryTop5'
import PieTierDistribution from '@/components/charts/PieTierDistribution'

export default function RevenueDashboardPage() {
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [company, setCompany] = useState<'전체'|'Company A'|'Company B'|'Company C'|'Company D'>('전체')
  const [lifecycleFilter, setLifecycleFilter] = useState<'전체'|'1월'|'2월'|'3월'|'4월'|'5월'|'6월'|'7월'|'8월'|'9월'|'10월'|'11월'|'12월'>('전체')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // API 데이터 상태
  const [revenueTrends, setRevenueTrends] = useState<any>(null)
  const [standardCompanies, setStandardCompanies] = useState<any[]>([])
  const [businessCompanies, setBusinessCompanies] = useState<any[]>([])
  const [calendarData, setCalendarData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  // 차트 데이터 (API에서 가져온 데이터 사용)
  const labels = revenueTrends?.items?.map((item: any) => item.month) || ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  
  const subscriptionSeries = revenueTrends ? [
    {
      label: 'Standard',
      data: revenueTrends.items.map((item: any) => item.subscriptionRevenue.standard)
    },
    {
      label: 'Business',
      data: revenueTrends.items.map((item: any) => item.subscriptionRevenue.business)
    }
  ] : [
    {
      label: 'Standard',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      label: 'Business',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  ]

  const usageSeries = revenueTrends ? [
    {
      label: '일반음원',
      data: revenueTrends.items.map((item: any) => item.usageRevenue.general)
    },
    {
      label: '가사만',
      data: revenueTrends.items.map((item: any) => item.usageRevenue.lyrics)
    },
    {
      label: 'Inst음원',
      data: revenueTrends.items.map((item: any) => item.usageRevenue.instrumental)
    }
  ] : [
    {
      label: '일반음원',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      label: '가사만',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      label: 'Inst음원',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  ]



  const formatAmountFull = (amount: number) => {
    if (amount === 0) return '0'
    const hasFraction = Math.abs(amount % 1) > 0
    return amount.toLocaleString('ko-KR', {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    })
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentMonth(newDate)
  }

  const fetchCalendarData = async (year: number, month: number) => {
    try {
      const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const res = await fetch(`${baseUrl}/admin/companies/revenue/calendar?yearMonth=${yearMonth}`)
      if (res.ok) {
        const data = await res.json()
        setCalendarData(data)
      }
    } catch (e) {
      console.error('달력 데이터 조회 실패:', e)
    }
  }

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
        const [trendsRes, standardRes, businessRes] = await Promise.all([
          fetch(`${baseUrl}/admin/companies/revenue/trends`),
          fetch(`${baseUrl}/admin/companies/revenue/companies?grade=standard`),
          fetch(`${baseUrl}/admin/companies/revenue/companies?grade=business`)
        ])
        
        if (trendsRes.ok) {
          const trendsData = await trendsRes.json()
          setRevenueTrends(trendsData)
        }
        
        if (standardRes.ok) {
          const standardData = await standardRes.json()
          setStandardCompanies(standardData.items || [])
        }
        
        if (businessRes.ok) {
          const businessData = await businessRes.json()
          setBusinessCompanies(businessData.items || [])
        }
      } catch (e: any) {
        setError(e.message || '데이터 조회 실패')
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
    fetchCalendarData(currentMonth.getFullYear(), currentMonth.getMonth())
  }, [])

  useEffect(() => {
    fetchCalendarData(currentMonth.getFullYear(), currentMonth.getMonth())
  }, [currentMonth])

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

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full px-6 py-6">
      {/* 달력 섹션 */}
      <section className="mb-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title variant="section">월별 매출 달력</Title>
            
            {/* 월별 요약 정보 (총 매출 제거) */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-white/60">이번 달 구독료</div>
                <div className="text-base font-bold text-teal-400">
                  ₩{calendarData?.monthlySummary?.subscriptionRevenue?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-white/60">이번 달 사용료</div>
                <div className="text-base font-bold text-blue-400">
                  ₩{calendarData?.monthlySummary?.usageRevenue?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => changeMonth('prev')}
                className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm"
              >
                ◀
              </button>
              <span className="text-base font-medium text-white">
                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
              </span>
              <button
                onClick={() => changeMonth('next')}
                className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm"
              >
                ▶
              </button>
            </div>
          </div>
          
                    <div className="grid grid-cols-7">
            {/* 요일 헤더 */}
            <div className="p-2 text-center text-xs font-medium text-white/60">일</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">월</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">화</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">수</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">목</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">금</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">토</div>
            
            {/* 날짜 그리드 */}
            {calendarData?.days?.map((day: any, index: number) => {
              const date = new Date(day.date)
              const isToday = date.toDateString() === new Date().toDateString()
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[60px] p-2 border-b border-r border-white/10
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                    ${isToday ? 'bg-teal-500/20 border-teal-400' : ''}
                    ${index % 7 === 6 ? 'border-r-0' : ''}
                    ${index >= (calendarData.days.length - 1) ? 'border-b-0' : ''}
                  `}
                >
                  <div className="text-xs text-white/60 mb-1">
                    {date.getDate()}
                  </div>
                  {isCurrentMonth && (
                    <div className="space-y-0.5">
                      <div className="text-xs text-teal-400">
                        구독: ₩{formatAmountFull(day.subscriptionRevenue)}
                      </div>
                      <div className="text-xs text-blue-400">
                        사용: ₩{formatAmountFull(day.usageRevenue)}
                      </div>
                    </div>
                  )}
                </div>
              )
            }) || (
              <div className="col-span-7 py-8 text-center text-white/40">
                데이터를 불러오는 중...
              </div>
            )}
          </div>
          
          
        </Card>
      </section>

      {/* Charts Section */}
      <section className="mb-8">
        <Title variant="section" className="mb-4">매출 분석</Title>
        <div className="grid gap-5 [grid-template-columns:1fr_1fr] max-[1200px]:grid-cols-1">
          <Card>
            <Title variant="card" className="mb-4">월별 구독료 추이</Title>
            <div className="h-80">
              <SimpleLineChart labels={labels} series={subscriptionSeries} />
            </div>
          </Card>
          <Card>
            <Title variant="card" className="mb-4">월별 사용료 추이</Title>
            <div className="h-80">
              <SimpleLineChart labels={labels} series={usageSeries} />
            </div>
          </Card>
        </div>
      </section>

      {/* TOP Companies Section */}
      <section className="mb-8">
        <Title variant="section" className="mb-4">기업별 매출 현황</Title>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(380px,1fr))]">
          {/* Standard TOP */}
          <Card>
            <Title variant="card" className="mb-4">Standard 등급 TOP 기업</Title>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">순위</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">기업명</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">매출</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">비중</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {standardCompanies.length > 0 ? (
                    standardCompanies.map((company, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className={`py-2 px-3 font-medium text-center ${
                          i < 3 ? 'text-teal-300' : 'text-white/60'
                        }`}>{company.rank}</td>
                        <td className="py-2 px-3 text-white/80 text-center">{company.companyName}</td>
                        <td className="py-2 px-3 text-teal-400 font-semibold text-center">₩{company.totalRevenue.toLocaleString()}</td>
                        <td className="py-2 px-3 text-white/60 text-center">{company.percentage}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 px-3 text-center text-white/40">데이터를 불러오는 중...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Business TOP */}
          <Card>
            <Title variant="card" className="mb-4">Business 등급 TOP 기업</Title>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">순위</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">기업명</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">매출</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">비중</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {businessCompanies.length > 0 ? (
                    businessCompanies.map((company, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className={`py-2 px-3 font-medium text-center ${
                          i < 3 ? 'text-teal-300' : 'text-white/60'
                        }`}>{company.rank}</td>
                        <td className="py-2 px-3 text-white/80 text-center">{company.companyName}</td>
                        <td className="py-2 px-3 text-teal-400 font-semibold text-center">₩{company.totalRevenue.toLocaleString()}</td>
                        <td className="py-2 px-3 text-white/60 text-center">{company.percentage}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 px-3 text-center text-white/40">데이터를 불러오는 중...</td>
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