'use client'

import React, { useState, useEffect } from 'react'
import MusicDetailModal from '@/components/modals/MusicDetailModal'
import BulkRewardEditModal from '@/components/modals/BulkRewardEditModal'
import RewardEditModal from '@/components/modals/RewardEditModal'

type MusicRow = {
  musicId: number
  title: string
  artist: string
  category: string | null
  grade: 0 | 1 | 2
  validPlays: number
  earned: number
  companiesUsing: number
  lastUsedAt: string | null
  usageRate?: number
  monthlyLimit?: number
  rewardPerPlay?: number
}

// 카테고리별 일관된 색상 생성 함수
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
  
  // 카테고리명을 해시값으로 변환하여 일관된 색상 선택
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    const char = category.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32비트 정수로 변환
  }
  
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export default function RewardsMusicsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [yearMonth, setYearMonth] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [limitFilter, setLimitFilter] = useState('전체')
  const [musicTypeFilter, setMusicTypeFilter] = useState<'all'|'inst'|'normal'>('all')
  const [usageFilter, setUsageFilter] = useState('전체')
  const [companyFilter, setCompanyFilter] = useState('전체')
  const [rewardFilter, setRewardFilter] = useState('전체')
  const [idFilter, setIdFilter] = useState('전체')
  const [sortBy, setSortBy] = useState<'music_id'|'title'|'artist'|'category'|'grade'|'validPlays'|'earned'|'companiesUsing'|'lastUsedAt'|'monthlyLimit'|'rewardPerPlay'|'usageRate'>('earned')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMusic, setSelectedMusic] = useState<MusicRow | null>(null)
  
  const [selectedMusics, setSelectedMusics] = useState<string[]>([])
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false)
  const [rewardEditModalOpen, setRewardEditModalOpen] = useState(false)
  const [selectedMusicForReward, setSelectedMusicForReward] = useState<MusicRow | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<MusicRow[]>([])
  const [total, setTotal] = useState(0)

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const fetchRows = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (yearMonth) params.set('yearMonth', yearMonth)
      if (searchTerm) params.set('search', searchTerm)
      if (categoryFilter && /^\d+$/.test(categoryFilter)) params.set('categoryId', categoryFilter)
      if (musicTypeFilter && musicTypeFilter !== 'all') params.set('musicType', musicTypeFilter)
      // grade 필터는 현재 UI에 없으므로 제외
      params.set('page', String(currentPage))
      params.set('limit', String(itemsPerPage))
      params.set('sortBy', sortBy)
      params.set('order', sortOrder)
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/rewards/summary?${params.toString()}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setRows(data.items || [])
      setTotal(data.total || 0)
      if (!yearMonth && data.yearMonth) setYearMonth(data.yearMonth)
    } catch (e: any) {
      setError(e.message || '조회 실패')
      console.error('음원 리워드 요약 조회 실패:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, sortOrder, musicTypeFilter])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchRows()
  }

  // 체크박스 관련 함수들
  const handleSelectAll = () => {
    if (selectedMusics.length === filteredMusics.length) {
      setSelectedMusics([])
    } else {
      setSelectedMusics(filteredMusics.map(music => String(music.musicId)))
    }
  }

  const handleSelectMusic = (musicId: string) => {
    setSelectedMusics(prev => 
      prev.includes(musicId) 
        ? prev.filter(id => id !== musicId)
        : [...prev, musicId]
    )
  }

  const selectedMusicsData = rows
    .filter(music => selectedMusics.includes(String(music.musicId)))
    .map(m => ({
      id: String(m.musicId),
      title: m.title,
      category: (m as any).artist ?? '', // artist 필드 사용
      rewardPerPlay: Number((m as any).rewardPerPlay ?? 0),
      totalRewardCount: (m as any).monthlyLimit ?? null,
      status: 'active' as const,
    }))

  // 드롭다운 관련 함수들
  const toggleDropdown = (dropdownName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = openDropdown === dropdownName ? null : dropdownName
    setTimeout(() => {
      setOpenDropdown(newState)
    }, 0)
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
  }

  // 드롭다운 외부 클릭 시 닫기
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // 검색어나 필터 변경 시 페이지 리셋
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, categoryFilter, limitFilter, usageFilter, companyFilter, rewardFilter])

  const filteredMusics = rows

  // 페이지네이션 계산
  const totalPages = Math.max(Math.ceil(total / itemsPerPage), 1)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMusics = filteredMusics

  // 페이지 변경 함수
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-4">
      {!!error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 px-3 py-2 text-sm">
          조회 오류: {error}
        </div>
      )}
      {/* 검색/필터 및 음원 현황 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="month"
            value={yearMonth}
            onChange={(e) => { setYearMonth(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-white/10 rounded-lg bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
          />
          <div className="min-w-[300px]">
            <input
              type="text"
              placeholder="음원명, 카테고리로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white/90 font-medium hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {selectedMusics.length > 0 && (
            <button
              onClick={() => setBulkEditModalOpen(true)}
              className="px-3 py-2 bg-teal-500/90 text-white text-xs font-medium rounded-lg hover:bg-teal-400 transition-colors"
            >
              일괄 수정 ({selectedMusics.length}개)
            </button>
          )}
        </div>
        
        <div className="text-sm text-white/60">
          총 <span className="text-teal-300 font-semibold">{total}</span>개 음원
          {selectedMusics.length > 0 && (
            <span className="ml-2 text-teal-300">
              • 선택됨: <span className="text-teal-300 font-semibold">{selectedMusics.length}</span>개
            </span>
          )}
        </div>
      </div>

      {/* 음원 목록 */}
      <div className="overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead className="text-center">
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedMusics.length === filteredMusics.length && filteredMusics.length > 0}
                    onChange={handleSelectAll}
                    className="accent-teal-400 rounded" 
                  />
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('musicId', e)}
                      className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                        idFilter !== '전체' ? 'text-teal-400' : 'text-white/70'
                      }`}
                    >
                      <span>음원 ID</span>
                      <span className={`${
                        idFilter !== '전체' ? 'text-teal-400' : 'text-white/50'
                      }`}>▼</span>
                    </button>
                    {openDropdown === 'musicId' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setIdFilter('전체'); setSortBy('music_id'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${idFilter==='전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >전체</button>
                          <button 
                            onClick={() => { setIdFilter('오름차순'); setSortBy('music_id'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${idFilter==='오름차순' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >오름차순</button>
                          <button 
                            onClick={() => { setIdFilter('내림차순'); setSortBy('music_id'); setSortOrder('desc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${idFilter==='내림차순' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >내림차순</button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">음원명</th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('musicType', e)}
                      className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                        musicTypeFilter !== 'all' ? 'text-teal-400' : 'text-white/70'
                      }`}
                    >
                      <span>음원 유형</span>
                      <span className={`${
                        musicTypeFilter !== 'all' ? 'text-teal-400' : 'text-white/50'
                      }`}>▼</span>
                    </button>
                    {openDropdown === 'musicType' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[140px]">
                        <div className="py-1">
                          <button
                            onClick={() => { setMusicTypeFilter('all'); closeDropdown(); setCurrentPage(1); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${musicTypeFilter==='all' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >전체</button>
                          <button
                            onClick={() => { setMusicTypeFilter('inst'); closeDropdown(); setCurrentPage(1); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${musicTypeFilter==='inst' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >Inst</button>
                          <button
                            onClick={() => { setMusicTypeFilter('normal'); closeDropdown(); setCurrentPage(1); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${musicTypeFilter==='normal' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >일반</button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('monthlyLimit', e)}
                      className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                        limitFilter !== '전체' ? 'text-teal-400' : 'text-white/70'
                      }`}
                    >
                      <span>리워드 월 한도</span>
                      <span className={`${
                        limitFilter !== '전체' ? 'text-teal-400' : 'text-white/50'
                      }`}>▼</span>
                    </button>
                    {openDropdown === 'monthlyLimit' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setLimitFilter('전체'); setSortBy('music_id'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${limitFilter==='전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >전체</button>
                          <button 
                            onClick={() => { setLimitFilter('많은순'); setSortBy('monthlyLimit'); setSortOrder('desc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${limitFilter==='많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >많은순</button>
                          <button 
                            onClick={() => { setLimitFilter('적은순'); setSortBy('monthlyLimit'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${limitFilter==='적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >적은순</button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('rewardPerPlay', e)}
                      className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                        rewardFilter !== '전체' ? 'text-teal-400' : 'text-white/70'
                      }`}
                    >
                      <span>호출당 리워드</span>
                      <span className={`${
                        rewardFilter !== '전체' ? 'text-teal-400' : 'text-white/50'
                      }`}>▼</span>
                    </button>
                    {openDropdown === 'rewardPerPlay' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setRewardFilter('전체'); setSortBy('music_id'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${rewardFilter==='전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >전체</button>
                          <button 
                            onClick={() => { setRewardFilter('많은순'); setSortBy('rewardPerPlay'); setSortOrder('desc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${rewardFilter==='많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >많은순</button>
                          <button 
                            onClick={() => { setRewardFilter('적은순'); setSortBy('rewardPerPlay'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${rewardFilter==='적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >적은순</button>
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
                        usageFilter !== '전체' ? 'text-teal-400' : 'text-white/70'
                      }`}
                    >
                      <span>리워드 사용률</span>
                      <span className={`${
                        usageFilter !== '전체' ? 'text-teal-400' : 'text-white/50'
                      }`}>▼</span>
                    </button>
                    {openDropdown === 'usageRate' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setUsageFilter('전체'); setSortBy('music_id'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${usageFilter==='전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >전체</button>
                          <button 
                            onClick={() => { setUsageFilter('많은순'); setSortBy('usageRate'); setSortOrder('desc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${usageFilter==='많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >많은순</button>
                          <button 
                            onClick={() => { setUsageFilter('적은순'); setSortBy('usageRate'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${usageFilter==='적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >적은순</button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('company', e)}
                      className={`flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors ${
                        companyFilter !== '전체' ? 'text-teal-400' : 'text-white/70'
                      }`}
                    >
                      <span>사용중 기업</span>
                      <span className={`${
                        companyFilter !== '전체' ? 'text-teal-400' : 'text-white/50'
                      }`}>▼</span>
                    </button>
                    
                    {/* 사용 기업 드롭다운 메뉴 */}
                    {openDropdown === 'company' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setCompanyFilter('전체'); setSortBy('music_id'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${companyFilter==='전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >전체</button>
                          <button 
                            onClick={() => { setCompanyFilter('많은순'); setSortBy('companiesUsing'); setSortOrder('desc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${companyFilter==='많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >많은순</button>
                          <button 
                            onClick={() => { setCompanyFilter('적은순'); setSortBy('companiesUsing'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${companyFilter==='적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'}`}
                          >적은순</button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">액션</th>
              </tr>
            </thead>
            <tbody>
              {currentMusics.map((music, index) => {
                const usageRate = music.usageRate || 0
                
                // 유효재생률 계산 (예시 데이터)
                const totalPlays = Math.floor(music.validPlays * (1 + Math.random() * 0.3 + 0.1)) // 10-40% 추가
                const validRate = Math.round((music.validPlays / totalPlays) * 100)
                
                return (
                  <tr
                    key={music.musicId}
                    className={`border-b border-white/5 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                    } hover:bg-white/8 cursor-pointer`}
                    onClick={() => { setSelectedMusic(music); setModalOpen(true) }}
                  >
                    <td className="px-8 py-5 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedMusics.includes(String(music.musicId))}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleSelectMusic(String(music.musicId))}
                        className="accent-teal-400 rounded" 
                      />
                    </td>
                    <td className="px-8 py-5 text-white/80 text-center">{music.musicId}</td>
                    <td className="px-8 py-5 text-center">
                      <div className="font-semibold text-white">{music.title}</div>
                      <div className="text-xs text-white/60">{music.artist}</div>
                    </td>
                    <td className="px-8 py-5 text-white/80 text-center">{(music as any).musicType || '-'}</td>
                    <td className="px-8 py-5 text-white/80 text-center">{music.monthlyLimit ? music.monthlyLimit.toLocaleString() : '-'}</td>
                    <td className="px-8 py-5 text-white/80 text-center">{music.rewardPerPlay != null ? Number(music.rewardPerPlay).toLocaleString() : '-'}</td>
                    <td className="px-8 py-5 text-center">
                      {usageRate !== null ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-20 bg-white/10 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-teal-400 to-blue-400 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(usageRate, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${usageRate > 100 ? 'text-teal-300' : 'text-white/70'}`}>
                            {usageRate > 100 ? '100%' : `${usageRate}%`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/50 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-white/80 text-center">{music.companiesUsing}개</td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex gap-1.5 justify-center">
                        <button 
                          className="rounded-md bg-teal-500/90 px-2.5 py-1.5 text-xs text-white font-medium hover:bg-teal-400 transition-all duration-200"
                          onClick={(e) => { e.stopPropagation(); setSelectedMusic(music); setModalOpen(true) }}
                        >
                          상세
                        </button>
                        <button 
                          className="rounded-md bg-gray-500/90 px-2.5 py-1.5 text-xs text-white font-medium hover:bg-gray-400 transition-all duration-200"
                          onClick={(e) => { e.stopPropagation(); setSelectedMusicForReward(music); setRewardEditModalOpen(true) }}
                        >
                          리워드 수정
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="sticky bottom-0 flex items-center justify-center text-sm text-white/70 mt-8 bg-neutral-950 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <button 
            className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button 
            className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7" />
            </svg>
          </button>
          <span className="px-5 py-2.5 bg-gradient-to-r from-white/8 to-white/5 rounded-lg border border-white/10 font-medium">
            {currentPage} / {totalPages}
          </span>
          <button 
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button 
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 음원 상세 모달 */}
      {selectedMusic && (
        <MusicDetailModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedMusic(null)
          }}
          music={{
            id: String(selectedMusic.musicId),
            title: selectedMusic.title,
            category: selectedMusic.category || '-',
            monthlyUsed: selectedMusic.validPlays,
            monthlyLimit: null,
            companies: selectedMusic.companiesUsing,
            rewardPerPlay: 0,
            maxPlayCount: null,
            status: 'active',
            monthlyUsage: [],
            monthlyRewards: [],
            topCompanies: [],
            totalRewards: 0,
            totalPlays: 0,
            averageRating: 0,
            releaseDate: '',
            duration: '',
            artist: selectedMusic.artist,
          } as any}
        />
      )}


      {/* 일괄 수정 모달 */}
      <BulkRewardEditModal
        open={bulkEditModalOpen}
        onClose={() => {
          setBulkEditModalOpen(false)
          setSelectedMusics([])
        }}
        onSuccess={() => {
          // 일괄 수정 성공 시 페이지 새로고침
          fetchRows()
        }}
        selectedMusics={selectedMusicsData}
      />

      {/* 개별 리워드 수정 모달 */}
      {selectedMusicForReward && (
        <RewardEditModal
          open={rewardEditModalOpen}
          onClose={() => {
            setRewardEditModalOpen(false)
            setSelectedMusicForReward(null)
          }}
          onSuccess={() => {
            // 리워드 수정 성공 시 페이지 새로고침
            fetchRows()
          }}
          music={{
            id: String(selectedMusicForReward.musicId),
            title: selectedMusicForReward.title,
            category: selectedMusicForReward.artist || '-',
            rewardPerPlay: Number((selectedMusicForReward as any).rewardPerPlay ?? 0),
            totalRewardCount: (selectedMusicForReward as any).monthlyLimit ?? null,
            status: 'active' as const,
          }}
        />
      )}
    </div>
  )
} 