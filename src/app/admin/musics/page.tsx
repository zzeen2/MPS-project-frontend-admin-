'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const MusicStatsModal = dynamic(() => import('@/components/modals/MusicStatsModal'), { ssr: false })
import MusicEditModal from '@/components/modals/MusicEditModal'

export default function MusicsPage() {
  const [statsOpen, setStatsOpen] = useState(false)
  const [statsTitle, setStatsTitle] = useState<string>('음원 상세 통계')
  const [statsMusicData, setStatsMusicData] = useState<any>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editMusicData, setEditMusicData] = useState<any>(null)
  const [isCreateMode, setIsCreateMode] = useState(false)
  
  // 필터링 상태
  const [genreFilter, setGenreFilter] = useState('전체')
  const [musicTypeFilter, setMusicTypeFilter] = useState('전체')
  
  // 드롭다운 필터 상태
  const [idSortFilter, setIdSortFilter] = useState('전체')
  const [releaseDateSortFilter, setReleaseDateSortFilter] = useState('전체')
  const [rewardLimitFilter, setRewardLimitFilter] = useState('전체')
  
  // 정렬 상태 추가
  const [sortBy, setSortBy] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // 드롭다운 열림/닫힘 상태
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  
  // 카테고리 목록(백엔드에서 로드)
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])
  


  // API 연동을 위한 상태 변수들
  const [musics, setMusics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  // API 호출 함수
  const fetchMusics = async () => {
    setLoading(true)
    try {
      const url = `/admin/musics?page=${currentPage}&limit=10&search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(genreFilter)}&musicType=${encodeURIComponent(musicTypeFilter)}&idSortFilter=${encodeURIComponent(idSortFilter)}&releaseDateSortFilter=${encodeURIComponent(releaseDateSortFilter)}&rewardLimitFilter=${encodeURIComponent(rewardLimitFilter)}`
      console.log('🔍 Frontend API URL:', url)
      console.log('🔍 Frontend params:', { currentPage, searchQuery, genreFilter, musicTypeFilter, idSortFilter, releaseDateSortFilter, rewardLimitFilter })
      
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}${url}`)
      console.log('🔍 Frontend response status:', response.status)
      
      const data = await response.json()
      console.log('🔍 Frontend response data:', data)
      
      setMusics(data.musics || [])
      setTotalCount(data.totalCount || (data.musics ? data.musics.length : 0))
    } catch (error) {
      console.error('음원 조회 실패:', error)
      setMusics([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  // API 자동 호출을 위한 useEffect
  useEffect(() => {
    fetchMusics()
  }, [currentPage, searchQuery, genreFilter, musicTypeFilter, idSortFilter, releaseDateSortFilter, rewardLimitFilter])

  // 카테고리 목록 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
        const res = await fetch(`${baseUrl}/admin/musics/categories`)
        if (!res.ok) return
        const data = await res.json()
        setCategories(Array.isArray(data?.categories) ? data.categories : [])
      } catch (e) {
        console.error('카테고리 목록 로드 실패', e)
      }
    }
    loadCategories()
  }, [])

  // 페이지 외부 클릭 시 드롭다운 닫기
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null)
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleDelete = (ids: (string | number)[]) => {
    const numericIds = ids.map(id => typeof id === 'string' ? parseInt(id) : id)
    console.log('삭제할 ID들:', ids, '→ 숫자 변환:', numericIds)
    
    if (numericIds.length === 1) {
      setDeleteTarget(`음원 ID ${numericIds[0]}`)
    } else {
      setDeleteTarget(`${numericIds.length}개 음원`)
    }
    setDeleteModalOpen(true)
  }

  // 드롭다운 토글 함수
  const toggleDropdown = (dropdownName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = openDropdown === dropdownName ? null : dropdownName
    
    setTimeout(() => {
      setOpenDropdown(newState)
    }, 0)
  }
  
  // 드롭다운 닫기 함수
  const closeDropdown = () => {
    setOpenDropdown(null)
  }
  
  // 정렬 함수
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }
  
  // 체크박스 선택 핸들러
  const handleSelectItem = (id: number) => {
    const newSelectedItems = new Set(selectedItems)
    if (newSelectedItems.has(id)) {
      newSelectedItems.delete(id)
    } else {
      newSelectedItems.add(id)
    }
    setSelectedItems(newSelectedItems)
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set())
      setSelectAll(false)
    } else {
      const allIds = musics.map(music => typeof music.id === 'string' ? parseInt(music.id) : music.id)
      setSelectedItems(new Set(allIds))
      setSelectAll(true)
    }
  }

  const confirmDelete = () => {
    if (deleteTarget.includes('개 음원')) {
      // 일괄 삭제: 선택된 음원들 삭제
      executeDelete(Array.from(selectedItems))
    } else {
      // 개별 삭제: 음원 ID 추출하여 삭제
      const musicId = parseInt(deleteTarget.match(/음원 ID (\d+)/)?.[1] || '0')
      if (musicId > 0) {
        executeDelete([musicId])
      }
    }
  }

  const handleItemSelect = (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id) : id
    console.log('선택된 음원 ID:', id, '→ 숫자 변환:', numericId)
    
    const newSelected = new Set(selectedItems)
    if (newSelected.has(numericId)) {
      newSelected.delete(numericId)
    } else {
      newSelected.add(numericId)
    }
    setSelectedItems(newSelected)
    setSelectAll(newSelected.size === musics.length)
  }

  const executeDelete = async (ids: number[]) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/admin/musics/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ ids })
      })
      
      if (response.ok) {
        // 성공 시 선택 초기화 및 목록 새로고침
        setSelectedItems(new Set())
        setSelectAll(false)
        setDeleteModalOpen(false)
        fetchMusics() // 목록 새로고침
      } else {
        console.error('삭제 실패:', response.statusText)
      }
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  const handleEdit = async (id: number) => {
    try {
      // ID 유효성 검사
      if (!id || isNaN(id) || id <= 0) {
        console.error('유효하지 않은 음원 ID:', id)
        alert('유효하지 않은 음원 ID입니다.')
        return
      }
      
      setIsCreateMode(false)
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/admin/musics/${id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
              const mapped = {
        id: String(data.id),
        title: data.title,
        artist: data.artist,
        category: data.category,
        tags: data.tags || '',
        releaseDate: data.releaseDate || '',
        durationSec: typeof data.durationSec === 'number' ? data.durationSec : '',
        musicType: data.musicType as '일반' | 'Inst',
        priceMusicOnly: undefined,
        priceLyricsOnly: undefined,
        priceBoth: undefined,
        rewardPerPlay: (typeof data.rewardPerPlay === 'number' ? data.rewardPerPlay : undefined),
        totalRewardCount: (typeof data.totalRewardCount === 'number'
          ? data.totalRewardCount
          : (typeof (data as any).maxPlayCount === 'number' ? (data as any).maxPlayCount : undefined)),

        maxPlayCount: (typeof data.totalRewardCount === 'number'
          ? data.totalRewardCount
          : (typeof (data as any).maxPlayCount === 'number' ? (data as any).maxPlayCount : undefined)),
        grade: typeof data.grade === 'number' ? (data.grade as 0 | 1 | 2) : (Number((data as any).grade) as 0 | 1 | 2),
        accessTier: (data.grade === 0 ? 'all' : 'subscribed') as 'all' | 'subscribed',
        lyricsText: data.lyricsText || '',
        lyricsFilePath: data.lyricsFilePath || '',
        audioFilePath: data.audioFilePath || '',
        coverImageUrl: data.coverImageUrl || '',
        lyricist: data.lyricist || '',
        composer: data.composer || '',
        arranger: data.arranger || '',
        isrc: data.isrc || ''
      }
      setEditMusicData(mapped)
      setEditModalOpen(true)
    } catch (e) {
      console.error('수정 데이터 로드 실패', e)
    }
  }

  // 페이지네이션 핸들러 추가
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalCount / 10)) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="space-y-6">
      {/* 검색/필터 및 음원 현황 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="min-w-[300px]">
            <input 
              className="w-full px-3 py-2 text-white placeholder-white/50 outline-none border border-white/10 rounded-lg focus:border-teal-400/50 transition-colors text-sm" 
              placeholder="음원명, 아티스트, 태그로 검색 .." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchMusics}
            className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white/90 font-medium hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={() => {
              setIsCreateMode(true)
              setEditMusicData(null)
              setEditModalOpen(true)
            }}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-sm font-medium text-white hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
          >
            음원 등록
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-white/90 font-medium">
            총 음원: <span className="text-teal-300 font-semibold">{totalCount}</span>개 | 
            선택됨: <span className="text-teal-300 font-semibold">{selectedItems.size}</span>개
          </div>
          <button 
            onClick={() => handleDelete(Array.from(selectedItems))}
            disabled={selectedItems.size === 0}
            className={`rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
              selectedItems.size === 0 
                ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            일괄 삭제 ({selectedItems.size})
          </button>
        </div>
      </div>

      {/* 목록 테이블 */}
      <div className="overflow-visible">
        {/* 로딩 상태 표시 */}
        {loading && (
          <div className="text-center py-8 text-white/90 font-medium">
            음원 목록을 불러오는 중...
          </div>
        )}
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead className="text-center">
              <tr className="border-b border-white/10">
                <th className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="accent-teal-400 rounded" 
                  />
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('idSort', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span className={idSortFilter !== '전체' ? 'text-teal-400' : 'text-white/70'}>음원번호</span>
                      <span className={idSortFilter !== '전체' ? 'text-teal-400' : 'text-white/50'}>▼</span>
                    </button>
                    
                    {openDropdown === 'idSort' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setIdSortFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              idSortFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setIdSortFilter('오름차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              idSortFilter === '오름차순' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            오름차순
                          </button>
                          <button 
                            onClick={() => { setIdSortFilter('내림차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              idSortFilter === '내림차순' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            내림차순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">제목</th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">아티스트</th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('musicType', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span className={musicTypeFilter !== '전체' ? 'text-teal-400' : 'text-white/70'}>음원 유형</span>
                      <span className={musicTypeFilter !== '전체' ? 'text-teal-400' : 'text-white/50'}>▼</span>
                    </button>
                    
                    {openDropdown === 'musicType' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setMusicTypeFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              musicTypeFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setMusicTypeFilter('일반'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              musicTypeFilter === '일반' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            일반
                          </button>
                          <button 
                            onClick={() => { setMusicTypeFilter('Inst'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              musicTypeFilter === 'Inst' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            Inst
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('category', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span className={genreFilter !== '전체' ? 'text-teal-400' : 'text-white/70'}>카테고리</span>
                      <span className={genreFilter !== '전체' ? 'text-teal-400' : 'text-white/50'}>▼</span>
                    </button>
                    
                    {openDropdown === 'category' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setGenreFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              genreFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            전체
                          </button>
                          {(categories || []).map((cat) => (
                            <button 
                              key={cat.id}
                              onClick={() => { setGenreFilter(cat.name); closeDropdown(); }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                                genreFilter === cat.name ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                              }`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">태그</th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('releaseDate', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span className={releaseDateSortFilter !== '전체' ? 'text-teal-400' : 'text-white/70'}>발매일</span>
                      <span className={releaseDateSortFilter !== '전체' ? 'text-teal-400' : 'text-white/50'}>▼</span>
                    </button>
                    
                    {openDropdown === 'releaseDate' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setReleaseDateSortFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              releaseDateSortFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setReleaseDateSortFilter('오름차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              releaseDateSortFilter === '오름차순' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            오름차순
                          </button>
                          <button 
                            onClick={() => { setReleaseDateSortFilter('내림차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              releaseDateSortFilter === '내림차순' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            내림차순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('rewardLimit', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span className={rewardLimitFilter !== '전체' ? 'text-teal-400' : 'text-white/70'}>월 최대 리워드 한도</span>
                      <span className={rewardLimitFilter !== '전체' ? 'text-teal-400' : 'text-white/50'}>▼</span>
                    </button>
                    
                    {openDropdown === 'rewardLimit' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setRewardLimitFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardLimitFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setRewardLimitFilter('오름차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardLimitFilter === '오름차순' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            오름차순
                          </button>
                          <button 
                            onClick={() => { setRewardLimitFilter('내림차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardLimitFilter === '내림차순' ? 'text-teal-300 bg-white/5' : 'text-white/90 font-medium'
                            }`}
                          >
                            내림차순
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
              {musics.map((item, index) => {
                // API에서 받은 데이터를 그대로 사용 (필터링/정렬 제거)
                const musicData = {
                  index: index,
                  id: item.id,                                    // 음원번호
                  title: item.title,                              // 제목
                  artist: item.artist,                            // 아티스트
                  musicType: item.musictype ? 'Inst' : '일반',    // 음원 유형 (musictype 필드 사용)
                  genre: item.category || '미분류',               // 카테고리 (category 필드 사용)
                  tags: item.tags || '-',                  // 태그 (tags 필드 사용)
                  releaseDate: item.releasedate ? new Date(item.releasedate).toLocaleDateString() : '미정', // 발매일 (releasedate 필드 사용)
                  maxRewardLimit: item.maxrewardlimit && item.maxrewardlimit > 0 ? `${item.maxrewardlimit}토큰` : '-',   // 월 최대 리워드 한도 (maxrewardlimit 필드 사용)
                }
                
                return (
                  <tr 
                    key={musicData.index} 
                    className={`border-b border-white/5 transition-all duration-200 cursor-pointer ${
                      musicData.index % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                    } hover:bg-white/8`}
                    onClick={async () => {
                      setStatsTitle(musicData.title)
                      try {
                        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
                        const res = await fetch(`${baseUrl}/admin/musics/${musicData.id}`)
                        const data = await res.json()
                        const tags = Array.isArray(data.tags) ? data.tags.join(',') : (data.tags || '')
                        const normalizedTags = Array.isArray(data.normalizedTags)
                          ? data.normalizedTags.join(',')
                          : (data.normalizedTags ?? (data as any).normalized_tags ?? '')
                        const rewardPerPlay = (typeof data.rewardPerPlay === 'number'
                          ? data.rewardPerPlay
                          : (Number(data.rewardPerPlay) || undefined))
                        const maxPlayCount = (
                          typeof data.maxPlayCount === 'number' ? data.maxPlayCount :
                          typeof data.totalRewardCount === 'number' ? data.totalRewardCount :
                          typeof (data as any).monthlyLimit === 'number' ? (data as any).monthlyLimit :
                          typeof (data as any).maxrewardlimit === 'number' ? (data as any).maxrewardlimit : undefined
                        )
                        setStatsMusicData({
                          id: String(data.id),
                          title: data.title,
                          artist: data.artist,
                          category: data.category,
                          genre: data.category,
                          tags,
                          normalizedTags,
                          releaseDate: data.releaseDate,
                          durationSec: data.durationSec,
                          musicType: data.musicType,
                          isrc: data.isrc,
                          createdAt: data.createdAt,
                          lyricsText: data.lyricsText,
                          lyricsFilePath: data.lyricsFilePath,
                          lyricist: data.lyricist,
                          composer: data.composer,
                          arranger: data.arranger,
                          priceMusicOnly: data.priceMusicOnly,
                          priceLyricsOnly: data.priceLyricsOnly,
                          grade: data.grade,
                          rewardPerPlay,
                          maxPlayCount,
                          accessTier: data.accessTier
                        })
                        setStatsOpen(true)
                      } catch (e) {
                        console.error('상세 조회 실패', e)
                      }
                    }}
                  >
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedItems.has(typeof musicData.id === 'string' ? parseInt(musicData.id) : musicData.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleItemSelect(musicData.id)
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="accent-teal-400 rounded" 
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="font-semibold text-white">{musicData.id}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-semibold text-white">{musicData.title}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-white/90 font-medium">{musicData.artist}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                        musicData.musicType === 'Inst' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {musicData.musicType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                        {musicData.genre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/90 font-medium text-center">{musicData.tags}</td>
                    <td className="px-6 py-4 text-white/90 font-medium text-center">{musicData.releaseDate}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-teal-400 font-medium">
                        {musicData.maxRewardLimit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button 
                          className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(musicData.id)
                          }}
                        >
                          수정
                        </button>
                        <button 
                          className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200" 
                          onClick={async (e) => {
                            e.stopPropagation()
                            setStatsTitle(musicData.title)
                            try {
                              const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
                              const res = await fetch(`${baseUrl}/admin/musics/${musicData.id}`)
                              if (!res.ok) throw new Error(`HTTP ${res.status}`)
                              const data = await res.json()
                              const tags = Array.isArray(data.tags) ? data.tags.join(',') : (data.tags || '')
                              const normalizedTags = Array.isArray(data.normalizedTags)
                                ? data.normalizedTags.join(',')
                                : (data.normalizedTags ?? (data as any).normalized_tags ?? '')
                              const rewardPerPlay = (typeof data.rewardPerPlay === 'number'
                                ? data.rewardPerPlay
                                : (Number(data.rewardPerPlay) || undefined))
                              const maxPlayCount = (
                                typeof data.maxPlayCount === 'number' ? data.maxPlayCount :
                                typeof data.totalRewardCount === 'number' ? data.totalRewardCount :
                                typeof (data as any).monthlyLimit === 'number' ? (data as any).monthlyLimit :
                                typeof (data as any).maxrewardlimit === 'number' ? (data as any).maxrewardlimit : undefined
                              )
                              setStatsMusicData({
                                id: String(data.id),
                                title: data.title,
                                artist: data.artist,
                                category: data.category,
                                genre: data.category,
                                tags,
                                normalizedTags,
                                releaseDate: data.releaseDate,
                                durationSec: data.durationSec,
                                musicType: data.musicType,
                                isrc: data.isrc,
                                createdAt: data.createdAt,
                                lyricsText: data.lyricsText,
                                lyricsFilePath: data.lyricsFilePath,
                                lyricist: data.lyricist,
                                composer: data.composer,
                                arranger: data.arranger,
                                priceMusicOnly: data.priceMusicOnly,
                                grade: data.grade,
                                priceLyricsOnly: data.priceLyricsOnly,
                                rewardPerPlay,
                                maxPlayCount,
                                accessTier: data.accessTier
                              })
                              setStatsOpen(true)
                            } catch (err) {
                              console.error('상세 조회 실패', err)
                            }
                          }}
                        >
                          상세
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
          {/* 첫 페이지로 */}
          <button 
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`rounded-lg border border-white/10 p-2.5 transition-all duration-200 hover:border-white/20 ${
              currentPage === 1 
                ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          
          {/* 이전 페이지 */}
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`rounded-lg border border-white/10 p-2.5 transition-all duration-200 hover:border-white/20 ${
              currentPage === 1 
                ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* 현재 페이지 / 총 페이지 */}
          <span className="px-5 py-2.5 bg-gradient-to-r from-white/8 to-white/5 rounded-lg border border-white/10 font-medium">
            {currentPage} / {Math.max(Math.ceil(totalCount / 10), 1)}
          </span>
          
          {/* 다음 페이지 */}
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(totalCount / 10)}
            className={`rounded-lg p-2.5 font-medium transition-all duration-200 ${
              currentPage >= Math.ceil(totalCount / 10)
                ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* 마지막 페이지로 */}
          <button 
            onClick={() => handlePageChange(Math.ceil(totalCount / 10))}
            disabled={currentPage >= Math.ceil(totalCount / 10)}
            className={`rounded-lg p-2.5 font-medium transition-all duration-200 ${
              currentPage >= Math.ceil(totalCount / 10)
                ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 통계 모달 */}
      <MusicStatsModal open={statsOpen} onClose={()=>setStatsOpen(false)} title={statsTitle} musicData={statsMusicData} />

      {/* 수정/등록 모달 */}
      {editModalOpen && (
        <MusicEditModal 
          open={true}
          onClose={() => {
            setEditModalOpen(false)
            setIsCreateMode(false)
          }} 
          onSuccess={() => {
            setEditModalOpen(false)
            setIsCreateMode(false)
            fetchMusics() // 목록 새로고침
          }}
          musicData={editMusicData}
          isCreateMode={isCreateMode}
          key={isCreateMode ? 'create' : String(editMusicData?.id ?? 'edit')}
        />
      )}

      {/* 삭제 확인 모달 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/90 p-6 text-white shadow-2xl backdrop-blur-md">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20">
                <svg className="h-8 w-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">음원 삭제 확인</h3>
              <p className="text-sm text-white/90 font-medium">
                <span className="font-medium text-white">"{deleteTarget}"</span> 음원을 삭제하시겠습니까?
              </p>
              <p className="mt-2 text-xs text-teal-400">이 작업은 되돌릴 수 없습니다.</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-medium hover:bg-white/10 transition-all duration-200"
              >
                취소
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2.5 text-sm text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
} 