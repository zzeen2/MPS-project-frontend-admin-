'use client'
import React, { useMemo, useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

type Props = { 
  open: boolean; 
  onClose: () => void; 
  isCreateMode?: boolean;
  musicData?: {
    id?: string;
    title: string;
    artist: string;
    category?: string;
    tags: string;
    releaseDate?: string;
    durationSec: number;
    musicType?: '일반' | 'Inst' | '가사만';
    priceMusicOnly?: number;
    priceLyricsOnly?: number;
    priceBoth?: number;
    priceRef?: number;
    rewardPerPlay: number;
    maxPlayCount: number;
    grade: 0 | 1 | 2;
    lyricsText?: string;
    lyricist?: string;
    composer?: string;
    arranger?: string;
    isrc?: string;
  }
}

export default function MusicEditModal({ open, onClose, isCreateMode = false, musicData }: Props) {
  if (!open) return null



  // 기본 정보
  const [title, setTitle] = useState(isCreateMode ? '' : (musicData?.title || ''))
  const [artist, setArtist] = useState(isCreateMode ? '' : (musicData?.artist || ''))
  const [category, setCategory] = useState(isCreateMode ? '' : (musicData?.category || ''))
  const [tags, setTags] = useState(isCreateMode ? '' : (musicData?.tags || ''))
  const [releaseDate, setReleaseDate] = useState(isCreateMode ? '' : (musicData?.releaseDate || ''))
  const [durationSec, setDurationSec] = useState<number | ''>(isCreateMode ? '' : (musicData?.durationSec || ''))
  const [musicType, setMusicType] = useState<'일반' | 'Inst' | '가사만'>(isCreateMode ? '일반' : '일반')
  
  // 메타데이터 정보
  const [lyricist, setLyricist] = useState(isCreateMode ? '' : (musicData?.lyricist || ''))
  const [composer, setComposer] = useState(isCreateMode ? '' : (musicData?.composer || ''))
  const [arranger, setArranger] = useState(isCreateMode ? '' : (musicData?.arranger || ''))
  const [isrc, setIsrc] = useState(isCreateMode ? '' : (musicData?.isrc || ''))
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [lyricsFile, setLyricsFile] = useState<File | null>(null)
  const [lyricsText, setLyricsText] = useState(isCreateMode ? '' : '')
  const [lyricsInputType, setLyricsInputType] = useState<'file' | 'text'>(isCreateMode ? 'text' : 'text')

  // 가격/리워드
  const [priceRef, setPriceRef] = useState(isCreateMode ? 7 : (musicData?.priceRef || 7))
  const [priceMusicOnly, setPriceMusicOnly] = useState(isCreateMode ? 7 : (musicData?.priceMusicOnly || 7))
  const [priceLyricsOnly, setPriceLyricsOnly] = useState(isCreateMode ? 2 : (musicData?.priceLyricsOnly || 2))
  const [priceBoth, setPriceBoth] = useState(isCreateMode ? 7 : (musicData?.priceBoth || 7))
  const [hasRewards, setHasRewards] = useState(isCreateMode ? true : (musicData?.grade === 1))
  const [rewardPerPlay, setRewardPerPlay] = useState(isCreateMode ? 0.007 : (musicData?.rewardPerPlay || 0.007))
  const [maxPlayCount, setMaxPlayCount] = useState<number | ''>(isCreateMode ? '' : (musicData?.maxPlayCount || ''))

  // API 설정
  const [grade, setGrade] = useState<0 | 1 | 2>(isCreateMode ? 1 : (musicData?.grade || 0))
  const [apiTier, setApiTier] = useState<'all' | 'premium'>(isCreateMode ? 'premium' : (musicData?.grade === 0 ? 'all' : 'premium'))
  const [rewardsDisabled, setRewardsDisabled] = useState(isCreateMode ? false : (musicData?.grade === 0))


  // 카테고리 데이터
  const [categories, setCategories] = useState<Array<{id: number, name: string}>>([])
  
  // 필드별 오류 상태
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  
  // 토스트 상태
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  
  const getBasename = (p?: string) => (p ? p.split('/').pop() || '' : '')
  // 수정 모드일 때 musicData에 따른 초기 상태 설정
  useEffect(() => {
    if (!isCreateMode && musicData) {
      const musicGrade = musicData.grade || 0;
      setGrade(musicGrade);
      
      if (musicGrade === 0) {
        setApiTier('all');
        setHasRewards(false);
        setRewardsDisabled(true);
      } else {
        setApiTier('premium');
        setHasRewards(musicGrade === 1);
        setRewardsDisabled(false);
      }
    }
  }, [isCreateMode, musicData]);
  const handleApiTierChange = (tier: 'all' | 'premium') => {
    setApiTier(tier)
    if (tier === 'all') {
      // 모든 등급 선택 시
      setGrade(0)
      setHasRewards(false)
      setRewardsDisabled(true)
    } else {
      // standard+ 등급 선택 시
      setRewardsDisabled(false)
      // 리워드 체크박스 상태에 따라 grade 설정
      setGrade(hasRewards ? 1 : 2)
    }
  }

  const handleRewardsChange = (checked: boolean) => {
    setHasRewards(checked)
    if (apiTier === 'premium') {
      setGrade(checked ? 1 : 2)
    }
  }

  // 카테고리 인라인 생성 UI 상태
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  const handleAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) {
      showToastMessage('카테고리 이름을 입력하세요.', 'error')
      return
    }
    try {
      setAddingCategory(true)
      const res = await fetch('/admin/musics/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({}))
        showToastMessage(err?.message || '카테고리 생성 실패', 'error')
        return
      }
      const data = await res.json()
      const created = { id: data.id ?? Date.now(), name: data.name ?? name }
      setCategories(prev => [...prev, created])
      setCategory(created.name)
      setShowAddCategory(false)
      setNewCategoryName('')
      // 성공 토스트 제거
    } catch (e) {
      showToastMessage('카테고리 생성 중 오류가 발생했습니다.', 'error')
      console.error(e)
    } finally {
      setAddingCategory(false)
    }
  }

  useEffect(() => {
    if (!isCreateMode && musicData) {
      if (typeof musicData.rewardPerPlay === 'number') {
        setRewardPerPlay(musicData.rewardPerPlay)
        setHasRewards(true)
      }
      if (typeof musicData.maxPlayCount === 'number') {
        setMaxPlayCount(musicData.maxPlayCount)
        setHasRewards(true)
      }
    }
  }, [isCreateMode, musicData])


  // 카테고리 데이터 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('카테고리 데이터 가져오기 시작...')
        const response = await fetch('/admin/musics/categories')
        
        if (response.ok) {
          const data = await response.json()
          console.log('받은 카테고리 데이터:', data)
          console.log('카테고리 배열:', data.categories)
          setCategories(data.categories || [])
          console.log('categories 상태 설정 완료')
        } else {
          console.error('API 응답 실패:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('카테고리 조회 실패:', error)
      }
    }
    
    fetchCategories()
  }, [])

  // categories 상태 변화 감지
  useEffect(() => {
    console.log('categories 상태 변경됨:', categories)
  }, [categories])



  // 미리보기
  const totalReward = useMemo(() => {
    const rewardPerPlayNum = Number(rewardPerPlay) || 0
    const maxPlayCountNum = Number(maxPlayCount) || 0
    
    if (maxPlayCountNum > 0) {
      return rewardPerPlayNum * maxPlayCountNum
    }
    
    return 0
  }, [rewardPerPlay, maxPlayCount])

  function onSelectAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setAudioFile(f)
      validateField('audioFile', f) // 실시간 검증 추가
      
      // 파일 크기 자동 설정
      const fileSizeBytes = f.size
      
      // Web Audio API로 재생시간 자동 추출
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const fileReader = new FileReader()
      
      fileReader.onload = function(e) {
        const arrayBuffer = e.target?.result as ArrayBuffer
        audioContext.decodeAudioData(arrayBuffer, function(buffer) {
          const duration = Math.round(buffer.duration)
          setDurationSec(duration)
          
          // 파일 정보 로그
          console.log('음원 파일 정보:', {
            name: f.name,
            size: fileSizeBytes,
            duration: duration + '초'
          })
        }, function(error) {
          console.error('오디오 파일 디코딩 실패:', error)
        })
      }
      
      fileReader.readAsArrayBuffer(f)
    }
  }

  function onSelectThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setThumbFile(f)
  }

  function onSelectLyrics(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setLyricsFile(f)
  }



  // 음원 등록 완료 후 재생 URL 생성
  const generatePlaybackUrls = (musicId: number) => {
    // 상대 경로 사용
    
    return {
      playMusic: `/api/musics/${musicId}/play`,
      downloadLyrics: `/api/musics/${musicId}/lyrics`,
      previewUrl: `/api/musics/${musicId}/preview`
    }
  }

  // 토스트 표시 함수
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    
    // 3초 후 자동으로 숨김
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  // 실시간 필드 검증
  const validateField = (fieldName: string, value: any) => {
    let error = ''
    
    switch (fieldName) {
      case 'audioFile':
        if (!value) error = '음원 파일을 선택해주세요'
        break
      case 'title':
        if (!value?.trim()) error = '음원명을 입력해주세요'
        break
      case 'artist':
        if (!value?.trim()) error = '아티스트를 입력해주세요'
        break
      case 'category':
        if (!value) error = '카테고리를 선택해주세요'
        break
      case 'musicType':
        if (!value) error = '음원 유형을 선택해주세요'
        break
      case 'releaseDate':
        if (!value) error = '발매일을 입력해주세요'
        break
      case 'isrc':
        if (!value?.trim()) error = 'ISRC를 입력해주세요'
        break
      case 'lyricsText':
        if (musicType !== 'Inst' && lyricsInputType === 'text' && !value?.trim()) {
          error = '가사를 입력해주세요'
        }
        break
      case 'lyricsFile':
        if (musicType !== 'Inst' && lyricsInputType === 'file' && !value) {
          error = '가사 파일을 선택해주세요'
        }
        break
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }))
    
    return error
  }

  // 필수 필드 검증
  const validateRequiredFields = () => {
    const errors: string[] = []
    
    if (!audioFile) errors.push('음원 파일을 선택해주세요')
    if (!title.trim()) errors.push('음원명을 입력해주세요')
    if (!artist.trim()) errors.push('아티스트를 입력해주세요')
    if (!category) errors.push('카테고리를 선택해주세요')
    if (!musicType) errors.push('음원 유형을 선택해주세요')
    if (!releaseDate) errors.push('발매일을 입력해주세요')
    if (!isrc?.trim()) errors.push('ISRC를 입력해주세요')
    
    // 가사 필드는 Inst가 아닐 때만 필수
    if (musicType !== 'Inst') {
      if (lyricsInputType === 'text' && !lyricsText?.trim()) {
        errors.push('가사를 입력해주세요')
      } else if (lyricsInputType === 'file' && !lyricsFile) {
        errors.push('가사 파일을 선택해주세요')
      }
    }
    
    return errors
  }

  async function onSave() {
    if (isCreateMode) {
      // 실시간 검증으로 이미 모든 필드가 검증되었으므로 바로 진행
      try {
        // 상대 경로 사용

        // 1) 파일 업로드 (오디오/가사)
        const formData = new FormData()
        if (audioFile) formData.append('audio', audioFile)
        if (lyricsInputType === 'file' && lyricsFile) formData.append('lyrics', lyricsFile)
        if (thumbFile) formData.append('cover', thumbFile)

        const uploadRes = await fetch('/admin/musics/upload', {
          method: 'POST',
          body: formData
        })
        if (!uploadRes.ok) {
          showToastMessage('파일 업로드에 실패했습니다.', 'error')
          return
        }
        const uploadData = await uploadRes.json()
        const audioPath = uploadData.audioFilePath
        const lyricsPath = uploadData.lyricsFilePath

        if (!audioPath) {
          showToastMessage('오디오 파일 업로드 결과가 없습니다.', 'error')
          return
        }

        // 2) 음원 등록
        const response = await fetch('/admin/musics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            artist,
            category,
            tags,
            releaseDate,
            durationSec,
            musicType,
            lyricist,
            composer,
            arranger,
            isrc,
            priceMusicOnly,
            priceLyricsOnly,
            rewardPerPlay,
            maxPlayCount,
            hasRewards,
            grade,
            lyricsText: lyricsInputType === 'text' ? lyricsText : undefined,
            lyricsInputType,
            audioFilePath: audioPath,
            coverImagePath: uploadData.coverImagePath || undefined,
            lyricsFilePath: lyricsInputType === 'file' ? lyricsPath : undefined
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log('음원 등록 성공:', result)
          showToastMessage(`음원 등록이 완료되었습니다!`)
          setTimeout(() => { onClose() }, 1000)
        } else {
          const errorData = await response.json().catch(() => ({}))
          showToastMessage(`음원 등록 실패`, 'error')
          console.error('음원 등록 실패:', errorData)
        }
      } catch (error) {
        console.error('음원 등록 에러:', error)
        // 실시간 검증으로 이미 모든 필드가 검증되었으므로 여기서는 네트워크 오류만 처리
      }
    } else {
      // 수정 모드: 허용 필드만 PATCH
      try {
        // 상대 경로 사용
        if (!musicData?.id) throw new Error('수정 대상 ID가 없습니다.')
        const payload: any = {
          title, artist, category, tags, releaseDate,
          grade, lyricsText,
          // 가격류는 필요 시에만 보냄
        }
        const res = await fetch(`/admin/musics/${musicData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const err = await res.json().catch(()=>({}))
          showToastMessage('수정 실패: 금지된 필드 포함 여부를 확인하세요.', 'error')
          console.error('수정 실패', err)
          return
        }
        showToastMessage('수정이 완료되었습니다!')
        setTimeout(()=> onClose(), 800)
      } catch (e) {
        console.error('수정 에러', e)
        showToastMessage('수정 중 오류가 발생했습니다.', 'error')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] rounded-2xl border border-white/10 bg-neutral-900/90 text-white shadow-2xl backdrop-blur-md flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-semibold text-white">{isCreateMode ? '음원 등록' : '음원 수정'}</h3>

          </div>
          <button 
            onClick={onClose} 
            className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/15 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
          <div className="space-y-6">
            {/* 기본 정보 섹션 */}
            <Card>
              <Title>음원 기본 정보</Title>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/80">음원 파일 (.mp3/.wav/.flac) <span className="text-red-400">*</span></label>
                  <input 
                    type="file" 
                    accept=".mp3,.wav,.flac" 
                    onChange={onSelectAudio} 
                    disabled={!isCreateMode}
                    className={`w-full rounded-lg px-3 py-2.5 text-sm text-white ring-1 transition-all duration-200 ${
                      fieldErrors.audioFile ? 'bg-red-500/20 ring-red-500/50' : 'bg-black/30 ring-white/8'
                    } ${!isCreateMode ? 'opacity-50 cursor-not-allowed' : ''} file:mr-3 file:rounded-lg file:border-0 file:bg-teal-500/20 file:px-3 file:py-1.5 file:text-teal-300 hover:file:bg-teal-500/30`}
                  />
                  {audioFile ? (
                    <div className="flex items-center gap-2 text-sm text-teal-300">
                      <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                      선택됨: {audioFile.name}
                    </div>
                  ) : (!isCreateMode && (musicData as any)?.audioFilePath) ? (
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <span className="w-2 h-2 bg-white/30 rounded-full"></span>
                      현재 파일: {getBasename((musicData as any).audioFilePath)}
                    </div>
                  ) : null}
                  {fieldErrors.audioFile && (
                    <div className="text-sm text-red-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      {fieldErrors.audioFile}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/80">썸네일 (.jpg/.png)</label>
                  <div className="space-y-3">
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png" 
                      onChange={onSelectThumb} 
                      disabled={!isCreateMode}
                      className={`w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm text-white ring-1 ring-white/8 transition-all duration-200 ${!isCreateMode ? 'opacity-50 cursor-not-allowed' : ''} file:mr-3 file:rounded-lg file:border-0 file:bg-teal-500/20 file:px-3 file:py-1.5 file:text-teal-300 hover:file:bg-teal-500/30`} 
                    />
                    {thumbFile ? (
                      <div className="flex items-center gap-2 text-sm text-teal-300">
                        <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                        선택됨: {thumbFile.name}
                      </div>
                    ) : (!isCreateMode && (musicData as any)?.coverImageUrl) ? (
                      <div className="text-sm text-white/70">
                        현재 썸네일: {getBasename((musicData as any).coverImageUrl)}
                      </div>
                    ) : (
                      <div className="text-xs text-white/50">
                        *미등록시 기본 이미지로 설정됩니다
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">음원명 <span className="text-red-400">*</span></label>
                  <input 
                    value={title} 
                    onChange={(e) => {
                      setTitle(e.target.value)
                      validateField('title', e.target.value)
                    }} 
                    placeholder="음원 제목을 입력하세요" 
                    className={`w-full rounded-lg px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 transition-all duration-200 ${
                      fieldErrors.title ? 'bg-red-500/20 ring-red-500/50' : 'bg-black/30 ring-white/8 focus:ring-2 focus:ring-teal-400/40'
                    }`}
                  />
                  {fieldErrors.title && (
                    <div className="text-sm text-red-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      {fieldErrors.title}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">아티스트 <span className="text-red-400">*</span></label>
                  <input 
                    value={artist} 
                    onChange={(e) => {
                      setArtist(e.target.value)
                      validateField('artist', e.target.value)
                    }} 
                    placeholder="아티스트명" 
                    className={`w-full rounded-lg px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 transition-all duration-200 ${
                      fieldErrors.artist ? 'bg-red-500/20 ring-red-500/50' : 'bg-black/30 ring-white/8 focus:ring-2 focus:ring-teal-400/40'
                    }`}
                  />
                  {fieldErrors.artist && (
                    <div className="text-sm text-red-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      {fieldErrors.artist}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">카테고리 <span className="text-red-400">*</span></label>
                  <select 
                    value={category || ''} 
                    onChange={(e) => {
                      setCategory(e.target.value)
                      validateField('category', e.target.value)
                    }} 
                    className={`w-full rounded-lg px-3 py-2.5 text-white outline-none ring-1 transition-all duration-200 ${
                      fieldErrors.category ? 'bg-red-500/20 ring-red-500/50' : 'bg-black/30 ring-white/8 focus:ring-2 focus:ring-teal-400/40'
                    }`}
                  >
                    <option value="">카테고리 선택</option>
                    {categories && categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>카테고리 로딩 중...</option>
                    )}
                  </select>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(v => !v)}
                      className="text-xs text-teal-300 hover:text-teal-200"
                    >
                      {showAddCategory ? '취소' : '+ 새 카테고리 추가'}
                    </button>
                  </div>
                  {showAddCategory && (
                    <div className="flex items-center gap-2">
                      <input
                        value={newCategoryName}
                        onChange={(e)=>setNewCategoryName(e.target.value)}
                        placeholder="새 카테고리 이름"
                        className="flex-1 rounded-lg bg-black/30 px-3 py-2 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={addingCategory}
                        className={`rounded-lg px-3 py-2 text-sm ${addingCategory ? 'bg-white/10 text-white/60' : 'bg-teal-600 text-white hover:bg-teal-500'}`}
                      >
                        추가
                      </button>
                    </div>
                  )}
                  {fieldErrors.category && (
                    <div className="text-sm text-red-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      {fieldErrors.category}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">음원 유형 <span className="text-red-400">*</span></label>
                  <select 
                    value={musicType} 
                    onChange={(e) => {
                      const newType = e.target.value as '일반' | 'Inst'
                      setMusicType(newType)
                      validateField('musicType', newType)
                      
                      // 음원 유형에 따라 기본 가격 자동 설정
                      if (newType === '일반') {
                        setPriceMusicOnly(7)
                        setPriceLyricsOnly(2)
                      } else {
                        setPriceMusicOnly(3)
                        setPriceLyricsOnly(2)
                      }
                    }} 
                    disabled={!isCreateMode}
                    className={`w-full rounded-lg px-3 py-2.5 text-white outline-none ring-1 transition-all duration-200 ${
                      fieldErrors.musicType ? 'bg-red-500/20 ring-red-500/50' : 'bg-black/30 ring-white/8 focus:ring-2 focus:ring-teal-400/40'
                    } ${!isCreateMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="일반">일반</option>
                    <option value="Inst">Inst</option>
                  </select>
                  {fieldErrors.musicType && (
                    <div className="text-sm text-red-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      {fieldErrors.musicType}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">발매일 <span className="text-red-400">*</span></label>
                  <input 
                    value={releaseDate} 
                    onChange={(e) => {
                      setReleaseDate(e.target.value)
                      validateField('releaseDate', e.target.value)
                    }} 
                    type="date" 
                    className={`w-full rounded-lg px-3 py-2.5 text-white outline-none ring-1 transition-all duration-200 ${
                      fieldErrors.releaseDate ? 'bg-red-500/20 ring-red-500/50' : 'bg-black/30 ring-white/8 focus:ring-2 focus:ring-teal-400/40'
                    }`}
                  />
                  {fieldErrors.releaseDate && (
                    <div className="text-sm text-red-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      {fieldErrors.releaseDate}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">태그 (쉼표로 구분)</label>
                  <input 
                    value={tags} 
                    onChange={(e)=>setTags(e.target.value)} 
                    placeholder="차분한, 릴렉스, 배경음악" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                
                {/* 메타데이터 정보 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">작사자</label>
                  <input 
                    value={lyricist} 
                    onChange={(e)=>setLyricist(e.target.value)} 
                    placeholder="김작사" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">작곡자</label>
                  <input 
                    value={composer} 
                    onChange={(e)=>setComposer(e.target.value)} 
                    placeholder="박작곡" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">편곡자</label>
                  <input 
                    value={arranger} 
                    onChange={(e)=>setArranger(e.target.value)} 
                    placeholder="이편곡" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">ISRC <span className="text-red-400">*</span></label>
                  <input 
                    value={isrc} 
                    onChange={(e) => {
                      setIsrc(e.target.value)
                      validateField('isrc', e.target.value)
                    }} 
                    disabled={!isCreateMode}
                    placeholder="KRZ0123456789" 
                    className={`w-full rounded-lg px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 transition-all duration-200 ${
                      fieldErrors.isrc ? 'bg-red-500/20 ring-red-500/50' : 'bg-black/30 ring-white/8 focus:ring-2 focus:ring-teal-400/40'
                    } ${!isCreateMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {fieldErrors.isrc && (
                    <div className="text-sm text-red-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      {fieldErrors.isrc}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">재생 시간 (초)</label>
                  <input 
                    value={durationSec} 
                    onChange={(e)=>setDurationSec(e.target.value ? Number(e.target.value) : '')} 
                    type="number" 
                    placeholder="180" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                {/* 가사 필드 - Inst가 아닐 때만 표시 */}
                {musicType !== 'Inst' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-white/80">가사</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-white/80">
                          <input 
                            type="radio" 
                            checked={lyricsInputType === 'text'} 
                            onChange={() => setLyricsInputType('text')} 
                            className="text-teal-500 focus:ring-teal-500/20"
                          /> 
                          직접 입력
                        </label>
                        <label className="flex items-center gap-2 text-white/80">
                          <input 
                            type="radio" 
                            checked={lyricsInputType === 'file'} 
                            onChange={() => setLyricsInputType('file')} 
                            className="text-teal-500 focus:ring-teal-500/20"
                          /> 
                          파일 업로드
                        </label>
                      </div>
                      
                      {lyricsInputType === 'text' ? (
                        <textarea 
                          value={lyricsText}
                          onChange={(e) => setLyricsText(e.target.value)}
                          placeholder="가사를 직접 입력하세요..." 
                          rows={4}
                          className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 resize-none" 
                        />
                      ) : (
                        <div className="space-y-2">
                          <input 
                            type="file" 
                            accept=".txt,.lrc,.srt" 
                            onChange={onSelectLyrics} 
                            className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm text-white ring-1 ring-white/8 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-500/20 file:px-3 file:py-1.5 file:text-teal-300 hover:file:bg-teal-500/30 transition-all duration-200" 
                          />
                          {lyricsFile ? (
                            <div className="flex items-center gap-2 text-sm text-teal-300">
                              <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                              선택됨: {lyricsFile.name}
                            </div>
                          ) : (!isCreateMode && (musicData as any)?.lyricsFilePath) ? (
                            <div className="flex items-center gap-2 text-sm text-white/70">
                              <span className="w-2 h-2 bg-white/30 rounded-full"></span>
                              현재 가사 파일: {getBasename((musicData as any).lyricsFilePath)}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 가격 설정 */}
            <Card>
              <Title>가격 설정</Title>
              <div className="pt-2">
                {musicType === '일반' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-1 text-sm text-white/60">일반 음원 가격</div>
                      <div className="relative w-full max-w-[160px]">
                        <input 
                          value={priceMusicOnly} 
                          onChange={(e)=>setPriceMusicOnly(Number(e.target.value)||0)} 
                          type="number" 
                          placeholder="7"
                          className="w-full pr-8 rounded-lg bg-black/30 px-3 py-2 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-center" 
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-white/60">원</span>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 text-sm text-white/60">가사 가격</div>
                      <div className="relative w-full max-w-[160px]">
                        <input 
                          value={priceLyricsOnly} 
                          onChange={(e)=>setPriceLyricsOnly(Number(e.target.value)||0)} 
                          type="number" 
                          placeholder="2"
                          className="w-full pr-8 rounded-lg bg-black/30 px-3 py-2 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-center" 
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-white/60">원</span>
                      </div>
                    </div>
                  </div>
                )}
                {musicType === 'Inst' && (
                  <div className="space-y-2">
                    <div className="mb-1 text-sm text-white/60">Inst 음원 가격</div>
                    <div className="relative w-full max-w-[160px]">
                      <input 
                        value={priceMusicOnly} 
                        onChange={(e)=>setPriceMusicOnly(Number(e.target.value)||0)} 
                        type="number" 
                        placeholder="3"
                        className="w-full pr-8 rounded-lg bg-black/30 px-3 py-2 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-center" 
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-white/60">원</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* API 권한 설정 */}
            <Card>
              <Title>API 권한 설정</Title>
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    id="api-all" 
                    name="apiTier" 
                    value="all"
                    checked={apiTier === 'all'}
                    onChange={() => handleApiTierChange('all')}
                    className="text-teal-400 focus:ring-teal-500/20"
                  />
                  <label htmlFor="api-all" className="text-sm text-white/80">
                    모든 등급 (free, standard, business)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    id="api-premium" 
                    name="apiTier" 
                    value="premium"
                    checked={apiTier === 'premium'}
                    onChange={() => handleApiTierChange('premium')}
                    className="text-teal-400 focus:ring-teal-500/20"
                  />
                  <label htmlFor="api-premium" className="text-sm text-white/80">
                    standard, business 등급만 사용 가능
                  </label>
                </div>
              </div>
            </Card>

                        {/* 리워드 설정 */}
            <Card>
              <Title>리워드 설정</Title>
              <div className={`mt-3 mb-4 ${rewardsDisabled ? 'opacity-50' : ''}`}>
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input 
                    type="checkbox" 
                    checked={hasRewards} 
                    onChange={(e) => handleRewardsChange(e.target.checked)}
                    disabled={rewardsDisabled}
                    className="text-teal-400 focus:ring-teal-500/20 rounded disabled:opacity-50"
                  /> 
                  이 음원에 리워드 시스템 적용
                </label>
                {rewardsDisabled && (
                  <p className="text-xs text-white/60 mt-1">
                    모든 등급 접근 가능한 음원은 리워드 시스템을 적용할 수 없습니다.
                  </p>
                )}
              </div>
              <div className="mt-3 mb-4">

              </div>
              {hasRewards && !rewardsDisabled && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">1회 호출당 리워드 (음원 재생/가사) <span className="text-red-400">*</span></label>
                    <input 
                      value={rewardPerPlay} 
                      onChange={(e)=>setRewardPerPlay(Number(e.target.value)||0)} 
                      type="number" 
                      step="0.001" 
                      className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">최대 재생 횟수 <span className="text-red-400">*</span></label>
                    <input 
                      value={maxPlayCount} 
                      onChange={(e)=>setMaxPlayCount(e.target.value ? Number(e.target.value) : '')} 
                      type="number" 
                      placeholder="1000" 
                      className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                    />
                  </div>
                </div>
              )}
              {hasRewards && (
                <div className="mt-4 rounded-lg border border-teal-500/20 bg-teal-500/10 p-4">
                  <div className="text-sm text-teal-300 font-medium mb-1">리워드 미리보기</div>
                  {maxPlayCount ? (
                    <p className="text-sm text-white/80">
                      총 리워드: <span className="text-sm font-semibold text-teal-300">{totalReward}</span> 토큰
                    </p>
                  ) : (
                    <p className="text-sm text-white/80">최대 재생 횟수를 입력하면 총 리워드를 확인할 수 있습니다</p>
                  )}
                </div>
              )}
            </Card>


          </div>
        </div>

        {/* 액션 푸터 */}
        <div className="border-t border-white/10 bg-neutral-900/90 p-4">
          <div className="flex items-center justify-end">
            <button 
              onClick={onSave} 
              disabled={isCreateMode && (
                !audioFile || 
                !title.trim() || 
                !artist.trim() || 
                !category || 
                !musicType || 
                !releaseDate || 
                !isrc?.trim()
              )}
              className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                isCreateMode && (
                  !audioFile || 
                  !title.trim() || 
                  !artist.trim() || 
                  !category || 
                  !musicType || 
                  !releaseDate || 
                  !isrc?.trim()
                )
                  ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700'
              }`}
            >
              {isCreateMode ? '등록 완료' : '수정 완료'}
            </button>
          </div>
        </div>

        {/* 토스트 메시지 */}
        {showToast && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-300`}>
            <div className={`px-8 py-4 rounded-lg shadow-2xl ${
              toastType === 'success' 
                ? 'bg-teal-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {toastType === 'success' ? '✅' : '❌'}
                </span>
                <span className="font-medium text-lg">{toastMessage}</span>
                <button 
                  onClick={() => setShowToast(false)}
                  className="ml-3 text-white/80 hover:text-white transition-colors text-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
      `}</style>
    </div>
  )
} 