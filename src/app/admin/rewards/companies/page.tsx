'use client'

import React, { useState } from 'react'
import CompanyDetailModal from '@/components/modals/CompanyDetailModal'

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
  contractStart: string
  contractEnd: string
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
  subscriptionStart: string
  subscriptionEnd: string
  businessNumber: string
}

type ApiItem = {
  companyId: number
  name: string
  tier: 'free' | 'standard' | 'business'
  totalTokens: number
  monthlyEarned: number
  monthlyUsed: number
  usageRate: number
  activeTracks: number
}

type ApiResponse = {
  items: ApiItem[]
  page: number
  limit: number
  total: number
  yearMonth: string
}

type CompanyRewardsDetail = {
  company: { id: number; name: string; tier: 'free'|'standard'|'business' }
  summary: { totalTokens: number; monthlyEarned: number; monthlyUsed: number; usageRate: number; activeTracks: number; yearMonth: string }
  daily: Array<{ date: string; earned: number; used: number }>
  byMusic: Array<{ musicId: number; title: string; artist: string; category: string | null; validPlays: number; earned: number }>
}

export default function CompanyRewardsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  
  // 드롭다운 필터 상태
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [tierFilter, setTierFilter] = useState('전체')
  const [tokensFilter, setTokensFilter] = useState('전체')
  const [earnedFilter, setEarnedFilter] = useState('전체')
  const [usedFilter, setUsedFilter] = useState('전체')
  const [usageRateFilter, setUsageRateFilter] = useState('전체')
  const [activeTracksFilter, setActiveTracksFilter] = useState('전체')
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 서버 데이터 상태
  const [companies, setCompanies] = useState<Company[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 상세 상태 추가
  const [detail, setDetail] = useState<CompanyRewardsDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailYearMonth, setDetailYearMonth] = useState<string | undefined>(undefined)

  // 드롭다운 관련 함수들
  const toggleDropdown = (dropdown: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = openDropdown === dropdown ? null : dropdown
    setTimeout(() => {
      setOpenDropdown(newState)
    }, 0)
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
  }

  // 외부 클릭 시 드롭다운 닫기
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // 서버 정렬 컬럼 매핑
  const mapSortByToServer = (key: string) => {
    switch (key) {
      case 'name':
        return 'name'
      case 'tokens':
        return 'total_tokens'
      case 'usage':
        return 'usage_rate'
      default:
        return 'company_id'
    }
  }

  // 티어 필터 합치기: selectedTier(상단)와 tierFilter(드롭다운)를 우선순위로 병합
  const effectiveTier = React.useMemo(() => {
    // 드롭다운이 '전체'가 아니면 드롭다운 우선
    if (tierFilter !== '전체') {
      if (tierFilter === 'Business') return 'business'
      if (tierFilter === 'Standard') return 'standard'
      if (tierFilter === 'Free') return 'free'
    }
    // 상단 선택값
    return selectedTier as 'all' | 'free' | 'standard' | 'business'
  }, [tierFilter, selectedTier])

  // 서버 호출
  React.useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams()
        if (searchTerm.trim()) params.set('search', searchTerm.trim())
        if (effectiveTier && effectiveTier !== 'all') params.set('tier', effectiveTier)
        params.set('page', String(currentPage))
        params.set('limit', String(itemsPerPage))
        params.set('sortBy', mapSortByToServer(sortBy))
        params.set('order', sortOrder)
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
        const url = `${baseUrl}/admin/companies/rewards/summary?${params.toString()}`
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: ApiResponse = await res.json()
        const mapped: Company[] = data.items.map(item => ({
          id: String(item.companyId),
          name: item.name,
          tier: item.tier === 'business' ? 'Business' : item.tier === 'standard' ? 'Standard' : 'Free',
          totalTokens: item.totalTokens ?? 0,
          monthlyEarned: item.monthlyEarned ?? 0,
          monthlyUsed: item.monthlyUsed ?? 0,
          usageRate: item.usageRate ?? 0,
          activeTracks: item.activeTracks ?? 0,
          // 이하 상세 모달용 플레이스홀더(상세 API 구현 시 대체)
      status: 'active',
          lastActivity: '',
          joinedDate: '',
          contactEmail: '',
          contactPhone: '',
          contractStart: '',
          contractEnd: '',
          monthlyUsage: [],
          monthlyRewards: [],
          topTracks: [],
          ceoName: '',
      profileImageUrl: '',
      homepageUrl: '',
      smartAccountAddress: '',
          apiKeyHash: '',
          createdAt: '',
          updatedAt: '',
          subscriptionStart: '',
          subscriptionEnd: '',
          businessNumber: ''
        }))
        setCompanies(mapped)
        setTotalCount(data.total)
      } catch (e: any) {
        if (e.name === 'AbortError') return
        setError(e.message || '데이터 로드 실패')
        // API 실패 시 더미 데이터 사용
        // setCompanies(dummyCompanies) // Removed dummy data
        // setTotalCount(dummyCompanies.length) // Removed dummy data
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => controller.abort()
  }, [searchTerm, effectiveTier, currentPage, itemsPerPage, sortBy, sortOrder])

  // 초기 로딩 시 더미 데이터 표시
  React.useEffect(() => {
    // if (companies.length === 0 && !loading) { // Removed dummy data
    //   setCompanies(dummyCompanies) // Removed dummy data
    //   setTotalCount(dummyCompanies.length) // Removed dummy data
    // } // Removed dummy data
  }, [companies.length, loading])

  const filteredCompanies = React.useMemo(() => {
    let filteredData = [...companies]
    
    // 기업 ID 정렬 (음원목록과 동일한 로직)
    if (sortBy === 'company_id' && sortOrder === 'asc') {
      filteredData.sort((a, b) => Number(a.id) - Number(b.id))
    } else if (sortBy === 'company_id' && sortOrder === 'desc') {
      filteredData.sort((a, b) => Number(b.id) - Number(a.id))
    }
    
    // 보유토큰 정렬
    else if (sortBy === 'total_tokens' && sortOrder === 'asc') {
      filteredData.sort((a, b) => a.totalTokens - b.totalTokens)
    } else if (sortBy === 'total_tokens' && sortOrder === 'desc') {
      filteredData.sort((a, b) => b.totalTokens - a.totalTokens)
    }
    
    // 이번 달 적립 정렬
    else if (sortBy === 'monthly_earned' && sortOrder === 'asc') {
      filteredData.sort((a, b) => a.monthlyEarned - b.monthlyEarned)
    } else if (sortBy === 'monthly_earned' && sortOrder === 'desc') {
      filteredData.sort((a, b) => b.monthlyEarned - a.monthlyEarned)
    }
    
    // 이번 달 사용 정렬
    else if (sortBy === 'monthly_used' && sortOrder === 'asc') {
      filteredData.sort((a, b) => a.monthlyUsed - b.monthlyUsed)
    } else if (sortBy === 'monthly_used' && sortOrder === 'desc') {
      filteredData.sort((a, b) => b.monthlyUsed - a.monthlyUsed)
    }
    
    // 사용률 정렬
    else if (sortBy === 'usage_rate' && sortOrder === 'asc') {
      filteredData.sort((a, b) => a.usageRate - b.usageRate)
    } else if (sortBy === 'usage_rate' && sortOrder === 'desc') {
      filteredData.sort((a, b) => b.usageRate - a.usageRate)
    }
    
    // 사용중 음원 정렬
    else if (sortBy === 'active_tracks' && sortOrder === 'asc') {
      filteredData.sort((a, b) => a.activeTracks - b.activeTracks)
    } else if (sortBy === 'active_tracks' && sortOrder === 'desc') {
      filteredData.sort((a, b) => b.activeTracks - a.activeTracks)
    }
    
    return filteredData
  }, [companies, sortBy, sortOrder])
  // 총 페이지는 서버 total 기준
  const totalPages = Math.max(Math.ceil(totalCount / itemsPerPage), 1)

  // 페이지 변경 시 현재 페이지를 1로 리셋
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedTier, tierFilter, tokensFilter, earnedFilter, usedFilter, usageRateFilter, sortBy, sortOrder])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Business': return 'bg-purple-500/20 text-purple-300'
      case 'Standard': return 'bg-blue-500/20 text-blue-300'
      case 'Free': return 'bg-gray-500/20 text-gray-300'
      default: return 'bg-white/10 text-white/80'
    }
  }

  const getDefaultYearMonth = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }

  const fetchCompanyDetail = async (companyId: string, yearMonth?: string) => {
    try {
      setDetailLoading(true)
      setDetailError(null)
      const params = new URLSearchParams()
      const ym = yearMonth ?? detailYearMonth ?? getDefaultYearMonth()
      if (ym) params.set('yearMonth', ym)
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const url = `${baseUrl}/admin/companies/${companyId}/rewards/detail?${params.toString()}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setDetail(data)
      setDetailYearMonth(ym)
    } catch (e: any) {
      setDetailError(e.message || '상세 조회 실패')
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 검색 및 기업 현황 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="min-w-[300px]">
            <input
              type="text"
              placeholder="기업명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
            />
          </div>
          <button 
            onClick={() => {}}
            className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white/90 font-medium hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-white/60">
          총 <span className="text-teal-300 font-semibold">{totalCount}</span>개 기업
        </div>
      </div>

      {/* 상태 표시 */}
      {error && (
        <div className="text-center text-red-400 py-10">{error}</div>
      )}

      {/* 기업 목록 */}
      {!loading && !error && (
      <div className="overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead className="text-center">
              <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/70 font-medium text-center">
                    <div className="relative">
                      <button 
                        onClick={(e) => toggleDropdown('companyId', e)}
                        className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                          sortBy === 'company_id' ? 'text-teal-400' : 'text-white/70'
                        }`}
                      >
                        <span>기업 ID</span>
                        <span className={`${
                          sortBy === 'company_id' ? 'text-teal-400' : 'text-white/50'
                        }`}>
                          ▼
                        </span>
                      </button>
                      {openDropdown === 'companyId' && (
                        <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                          <div className="py-1">
                            <button 
                              onClick={() => { 
                                setSortBy('company_id'); 
                                setSortOrder('asc'); 
                                closeDropdown(); 
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                                sortBy === 'company_id' && sortOrder === 'asc' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                              }`}
                            >
                              오름차순
                            </button>
                            <button 
                              onClick={() => { 
                                setSortBy('company_id'); 
                                setSortOrder('desc'); 
                                closeDropdown(); 
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                                sortBy === 'company_id' && sortOrder === 'desc' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                              }`}
                            >
                              내림차순
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">기업명</th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('tier', e)}
                        className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                          tierFilter !== '전체' ? 'text-teal-400' : 'text-white/70'
                        }`}
                    >
                      <span>등급</span>
                        <span className={`${
                          tierFilter !== '전체' ? 'text-teal-400' : 'text-white/50'
                        }`}>▼</span>
                    </button>
                    {openDropdown === 'tier' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setTierFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tierFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setTierFilter('Business'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tierFilter === 'Business' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Business
                          </button>
                          <button 
                            onClick={() => { setTierFilter('Standard'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tierFilter === 'Standard' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Standard
                          </button>
                          <button 
                            onClick={() => { setTierFilter('Free'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tierFilter === 'Free' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Free
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('tokens', e)}
                        className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                          tokensFilter !== '전체' ? 'text-teal-400' : 'text-white/70'
                        }`}
                    >
                      <span>보유 토큰</span>
                        <span className={`${
                          tokensFilter !== '전체' ? 'text-teal-400' : 'text-white/50'
                        }`}>▼</span>
                    </button>
                    {openDropdown === 'tokens' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                              onClick={() => { setTokensFilter('전체'); setSortBy('company_id'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tokensFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                              onClick={() => { setTokensFilter('많은순'); setSortBy('total_tokens'); setSortOrder('desc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tokensFilter === '많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            많은순
                          </button>
                          <button 
                              onClick={() => { setTokensFilter('적은순'); setSortBy('total_tokens'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tokensFilter === '적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            적은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('earned', e)}
                        className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                          earnedFilter !== '전체' ? 'text-teal-400' : 'text-white/70'
                        }`}
                    >
                      <span>이번 달 적립</span>
                        <span className={`${
                          earnedFilter !== '전체' ? 'text-teal-400' : 'text-white/50'
                        }`}>▼</span>
                    </button>
                    {openDropdown === 'earned' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setEarnedFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              earnedFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                              onClick={() => { setEarnedFilter('많은순'); setSortBy('monthly_earned'); setSortOrder('desc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              earnedFilter === '많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            많은순
                          </button>
                          <button 
                              onClick={() => { setEarnedFilter('적은순'); setSortBy('monthly_earned'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              earnedFilter === '적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            적은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('used', e)}
                        className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                          usedFilter !== '전체' ? 'text-teal-400' : 'text-white/70'
                        }`}
                    >
                      <span>이번 달 사용</span>
                        <span className={`${
                          usedFilter !== '전체' ? 'text-teal-400' : 'text-white/50'
                        }`}>▼</span>
                    </button>
                    {openDropdown === 'used' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                              onClick={() => { setUsedFilter('전체'); setSortBy('company_id'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usedFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                              onClick={() => { setUsedFilter('많은순'); setSortBy('monthly_used'); setSortOrder('desc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usedFilter === '많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            많은순
                          </button>
                          <button 
                              onClick={() => { setUsedFilter('적은순'); setSortBy('monthly_used'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usedFilter === '적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            적은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('usageRate', e)}
                        className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                          usageRateFilter !== '전체' ? 'text-teal-400' : 'text-white/70'
                        }`}
                    >
                      <span>누적 사용률</span>
                        <span className={`${
                          usageRateFilter !== '전체' ? 'text-teal-400' : 'text-white/50'
                        }`}>▼</span>
                    </button>
                    {openDropdown === 'usageRate' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                              onClick={() => { setUsageRateFilter('전체'); setSortBy('company_id'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usageRateFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                              onClick={() => { setUsageRateFilter('높은순'); setSortBy('usage_rate'); setSortOrder('desc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usageRateFilter === '높은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            높은순
                          </button>
                          <button 
                              onClick={() => { setUsageRateFilter('낮은순'); setSortBy('usage_rate'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usageRateFilter === '낮은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            낮은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('activeTracks', e)}
                        className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                          activeTracksFilter !== '전체' ? 'text-teal-400' : 'text-white/70'
                        }`}
                    >
                      <span>사용중 음원</span>
                        <span className={`${
                          activeTracksFilter !== '전체' ? 'text-teal-400' : 'text-white/50'
                        }`}>▼</span>
                    </button>
                    {openDropdown === 'activeTracks' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                              onClick={() => { setActiveTracksFilter('전체'); setSortBy('company_id'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              activeTracksFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                              onClick={() => { setActiveTracksFilter('많은순'); setSortBy('active_tracks'); setSortOrder('desc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              activeTracksFilter === '많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            많은순
                          </button>
                          <button 
                              onClick={() => { setActiveTracksFilter('적은순'); setSortBy('active_tracks'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              activeTracksFilter === '적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            적은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">액션</th>
              </tr>
            </thead>
            <tbody>
                {filteredCompanies.map((company, index) => (
                <tr 
                  key={company.id} 
                  className={`border-b border-white/5 transition-all duration-200 cursor-pointer ${
                  index % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                  } hover:bg-white/8`}
                  onClick={() => {
                    setSelectedCompany(company)
                      fetchCompanyDetail(company.id)
                    setModalOpen(true)
                  }}
                >
                  <td className="px-6 py-4 text-center">
                      <div className="font-mono text-sm text-white/90 font-medium truncate max-w-[160px] mx-auto" title={company.id}>{company.id}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                      <div className="text-white/90 font-medium">{company.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getTierColor(company.tier)}`}>
                      {company.tier}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-white/90 font-medium text-center">
                    {company.totalTokens.toLocaleString()}
                  </td>
                    <td className="px-8 py-5 text-white/90 font-medium text-center">
                      {company.monthlyEarned.toLocaleString()}
                  </td>
                    <td className="px-8 py-5 text-white/90 font-medium text-center">
                    {company.monthlyUsed.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-20 bg-white/10 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-teal-400 to-blue-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(company.usageRate, 100)}%` }}
                        />
                      </div>
                        <span className={`font-medium text-sm ${company.usageRate > 100 ? 'text-teal-300' : 'text-white/90'}`}>
                          {company.usageRate > 100 ? '100%' : `${company.usageRate}%`}
                        </span>
                    </div>
                  </td>
                    <td className="px-8 py-5 text-white/90 font-medium text-center">
                    {company.activeTracks}개
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      className="rounded-md bg-teal-500/90 px-2.5 py-1.5 text-xs text-white font-medium hover:bg-teal-400 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCompany(company)
                          fetchCompanyDetail(company.id)
                        setModalOpen(true)
                      }}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* 페이지네이션 */}
      <div className="sticky bottom-0 flex items-center justify-center text-sm text-white/70 mt-8 bg-neutral-950 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <button 
            className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button 
            className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-5 py-2.5 bg-gradient-to-r from-white/8 to-white/5 rounded-lg border border-white/10 font-medium">
            {currentPage} / {totalPages}
          </span>
          <button 
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button 
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 기업 상세 모달 */}
      {selectedCompany && (
        <CompanyDetailModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          company={selectedCompany}
          detail={detail}
          loading={detailLoading}
          error={detailError}
          currentYearMonth={detailYearMonth}
          onChangeYearMonth={(ym) => {
            if (!selectedCompany) return
            setDetailYearMonth(ym)
            fetchCompanyDetail(selectedCompany.id, ym)
          }}
        />
      )}
    </div>
  )
} 
