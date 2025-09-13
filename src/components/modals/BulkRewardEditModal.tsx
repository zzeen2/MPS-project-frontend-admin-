'use client'
import React, { useState } from 'react'
import { apiFetch } from '@/lib/api'

type Music = {
  id: string
  title: string
  category: string
  rewardPerPlay: number
  totalRewardCount: number | null
  status: 'active' | 'inactive'
}

interface BulkRewardEditModalProps {
  open: boolean
  onClose: () => void
  selectedMusics: Music[]
  onSuccess?: () => void
}

export default function BulkRewardEditModal({ open, onClose, selectedMusics, onSuccess }: BulkRewardEditModalProps) {
  const [editType, setEditType] = useState<'remove' | 'modify'>('modify')
  const [isLoading, setIsLoading] = useState(false)
  const [grade, setGrade] = useState<0 | 2>(0)

  // Grouping: with/without rewards
  const withRewardList = React.useMemo(
    () => selectedMusics.filter(m => (m.totalRewardCount ?? 0) > 0 && (m.rewardPerPlay ?? 0) > 0),
    [selectedMusics]
  )
  const withoutRewardList = React.useMemo(
    () => selectedMusics.filter(m => !((m.totalRewardCount ?? 0) > 0 && (m.rewardPerPlay ?? 0) > 0)),
    [selectedMusics]
  )
  const [applyWithGroup, setApplyWithGroup] = useState(true)
  const [applyWithoutGroup, setApplyWithoutGroup] = useState(true)

  // With-reward group controls
  const [withMode, setWithMode] = useState<'percent'|'absolute'>('percent')
  const [withRewardPct, setWithRewardPct] = useState<number | ''>('')
  const [withLimitPct, setWithLimitPct] = useState<number | ''>('')
  const [withRewardAbs, setWithRewardAbs] = useState<number | ''>('')
  const [withLimitAbs, setWithLimitAbs] = useState<number | ''>('')

  const [withoutRpp, setWithoutRpp] = useState<number | ''>('')
  const [withoutLimitVal, setWithoutLimitVal] = useState<number | ''>('')
  
  // With-reward group: remove option
  const [withRemove, setWithRemove] = useState(false)
  const [withRemoveGrade, setWithRemoveGrade] = useState<0 | 2>(0)

  // 모달이 열릴 때 초기화
  React.useEffect(() => {
    if (open) {
      setEditType('modify')
      setGrade(0)
      setApplyWithGroup(withRewardList.length > 0)
      setApplyWithoutGroup(withoutRewardList.length > 0)
      setWithMode('percent')
      setWithRewardPct('')
      setWithLimitPct('')
      setWithRewardAbs('')
      setWithLimitAbs('')
      setWithoutRpp('')
      setWithoutLimitVal('')
      setWithRemove(false)
      setWithRemoveGrade(0)
    }
  }, [open, withRewardList.length, withoutRewardList.length])

  if (!open || selectedMusics.length === 0) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const tasks = selectedMusics.map(async (music) => {
        // 리워드 제거 처리
        if (editType === 'remove') {
          const body = {
            totalRewardCount: 0,
            rewardPerPlay: 0,
            removeReward: true,
            grade: grade,
          }

          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
          const response = await apiFetch(`${baseUrl}/admin/musics/${music.id}/rewards`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          return true
        }

        // 그룹 기반 수정 로직
        const isWith = withRewardList.some(w => w.id === music.id)
        if (isWith && applyWithGroup) {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
          if (withRemove) {
            const body = { totalRewardCount: 0, rewardPerPlay: 0, removeReward: true, grade: withRemoveGrade }
            const res = await apiFetch(`${baseUrl}/admin/musics/${music.id}/rewards`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return true
          } else {
            let baseRpp = Number(music.rewardPerPlay || 0)
            let baseLimit = music.totalRewardCount ?? 0
            let newRpp = baseRpp
            let newLimit = baseLimit
            if (withMode === 'percent') {
              const doRpp = withRewardPct !== ''
              const doLimit = withLimitPct !== ''
              newRpp = doRpp ? Number((baseRpp * (1 + Number(withRewardPct)/100)).toFixed(6)) : baseRpp
              newLimit = doLimit ? Math.max(0, Math.round(baseLimit * (1 + Number(withLimitPct)/100))) : baseLimit
            } else {
              newRpp = withRewardAbs !== '' ? Number(withRewardAbs) : baseRpp
              newLimit = withLimitAbs !== '' ? Number(withLimitAbs) : baseLimit
            }
            const body = { totalRewardCount: newLimit, rewardPerPlay: newRpp }
            const res = await apiFetch(`${baseUrl}/admin/musics/${music.id}/rewards`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return true
          }
        }

        const isWithout = withoutRewardList.some(w => w.id === music.id)
        if (isWithout && applyWithoutGroup) {
          if (withoutRpp === '' && withoutLimitVal === '') return false
          const rpp = withoutRpp === '' ? 0 : Number(withoutRpp)
          const lim = withoutLimitVal === '' ? 0 : Number(withoutLimitVal)
          const body = { totalRewardCount: lim, rewardPerPlay: rpp }
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
          const res = await apiFetch(`${baseUrl}/admin/musics/${music.id}/rewards`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return true
        }

        // 적용 대상이 아니면 스킵
        return false

      })

      await Promise.all(tasks)
      
      if (onSuccess) {
        onSuccess()
      }
      
      onClose()
    } catch (error) {
      console.error('일괄 수정 실패:', error)
      alert('일괄 수정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  // Preview helpers
  const previewCount = 5

  const formatRpp = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '미설정'
    return Number(value).toFixed(6)
  }

  const formatLimit = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '미설정'
    return String(value)
  }

  const computeWithPreview = (music: Music) => {
    const baseRpp = Number(music.rewardPerPlay || 0)
    const baseLimit = music.totalRewardCount ?? null
    let newRpp = baseRpp
    let newLimit: number | null = baseLimit
    if (withRemove) {
      return { baseRpp, newRpp: 0, baseLimit, newLimit: 0 }
    }
    if (withMode === 'percent') {
      if (withRewardPct !== '') newRpp = Number((baseRpp * (1 + Number(withRewardPct) / 100)).toFixed(6))
      if (withLimitPct !== '' && baseLimit !== null) newLimit = Math.max(0, Math.round(baseLimit * (1 + Number(withLimitPct) / 100)))
    } else {
      if (withRewardAbs !== '') newRpp = Number(withRewardAbs)
      if (withLimitAbs !== '') newLimit = Number(withLimitAbs)
    }
    return { baseRpp, newRpp, baseLimit, newLimit }
  }

  const computeWithoutPreview = (music: Music) => {
    const baseRpp = Number(music.rewardPerPlay || 0)
    const baseLimit = music.totalRewardCount ?? null
    const newRpp = withoutRpp !== '' ? Number(withoutRpp) : null
    const newLimit = withoutLimitVal !== '' ? Number(withoutLimitVal) : null
    return { baseRpp, newRpp, baseLimit, newLimit }
  }


  const renderBody = () => {
    if (editType === 'remove') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-white mb-2">리워드 제거 설정</h3>
            <p className="text-sm text-white/60">제거 후 설정할 음원 등급을 선택하세요</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-white/60">음원 등급을 선택해주세요:</p>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="grade"
                    value="0"
                    checked={grade === 0}
                    onChange={(e) => setGrade(0)}
                    className="w-4 h-4 text-teal-400 bg-white/5 border-white/20 focus:ring-teal-400 focus:ring-2"
                  />
                  <span className="text-sm text-white/80">0: 모든 등급 접근 가능 (Free, Standard, Business)</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="grade"
                    value="2"
                    checked={grade === 2}
                    onChange={(e) => setGrade(2)}
                    className="w-4 h-4 text-teal-400 bg-white/5 border-white/20 focus:ring-teal-400 focus:ring-2"
                  />
                  <span className="text-sm text-white/80">2: Standard, Business만 접근 가능 (리워드 없음)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (editType === 'modify') {
      return (
        <div className="space-y-6">

          {/* 그룹 요약 & 대상 선택 (해당 그룹이 있을 때만 노출) */}
          <div className="flex flex-wrap items-center gap-3">
            {withRewardList.length > 0 && (
              <>
                <span className="text-xs text-white/70 bg-white/5 px-2 py-1 rounded">리워드 있음: {withRewardList.length}개</span>
                <label className="inline-flex items-center gap-2 text-xs text-white/80">
                  <input type="checkbox" className="accent-teal-400" checked={applyWithGroup} onChange={(e)=>setApplyWithGroup(e.target.checked)} /> 적용
                </label>
              </>
            )}
            {withoutRewardList.length > 0 && (
              <>
                <span className="text-xs text-white/70 bg-white/5 px-2 py-1 rounded ml-4">리워드 없음: {withoutRewardList.length}개</span>
                <label className="inline-flex items-center gap-2 text-xs text-white/80">
                  <input type="checkbox" className="accent-teal-400" checked={applyWithoutGroup} onChange={(e)=>setApplyWithoutGroup(e.target.checked)} /> 적용
                </label>
              </>
            )}
          </div>

          {/* 섹션: 리워드 있는 음원 (그룹이 있고 적용 중일 때만) */}
          {withRewardList.length > 0 && applyWithGroup && (
          <div className="p-4 border border-white/10 rounded-lg bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-teal-400 rounded"></span>
                리워드 있는 음원 ({withRewardList.length}개)
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <button type="button" disabled={withRemove} onClick={()=>setWithMode('percent')} className={`px-2 py-1 rounded border ${withMode==='percent' ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/10 text-white/70 border-white/20'} ${withRemove ? 'opacity-50 cursor-not-allowed' : ''}`}>퍼센트</button>
                <button type="button" disabled={withRemove} onClick={()=>setWithMode('absolute')} className={`px-2 py-1 rounded border ${withMode==='absolute' ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/10 text-white/70 border-white/20'} ${withRemove ? 'opacity-50 cursor-not-allowed' : ''}`}>절대값</button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded p-3 mb-3">
              <label className="inline-flex items-center gap-2 text-xs text-white/80">
                <input type="checkbox" className="accent-teal-400" checked={withRemove} onChange={(e)=>setWithRemove(e.target.checked)} />
                리워드 삭제하기
              </label>
              {withRemove && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-white/60">삭제 후 등급:</span>
                  <label className="inline-flex items-center gap-1"><input type="radio" className="accent-teal-400" checked={withRemoveGrade===0} onChange={()=>setWithRemoveGrade(0)} /> 모든 등급 (0)</label>
                  <label className="inline-flex items-center gap-1"><input type="radio" className="accent-teal-400" checked={withRemoveGrade===2} onChange={()=>setWithRemoveGrade(2)} /> Standard/Business only (2)</label>
                </div>
              )}
            </div>

            <div className={`${withRemove ? 'opacity-50 pointer-events-none' : ''}`}>
              {withMode==='percent' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">호출당 리워드 조정(%)</label>
                    <input type="number" step="0.1" value={withRewardPct} onChange={(e)=>setWithRewardPct(e.target.value ? Number(e.target.value) : '')} disabled={withRemove} className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white" placeholder="예: 10"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">월 한도 조정(%)</label>
                    <input type="number" step="0.1" value={withLimitPct} onChange={(e)=>setWithLimitPct(e.target.value ? Number(e.target.value) : '')} disabled={withRemove} className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white" placeholder="예: -5"/>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">호출당 리워드(절대값)</label>
                    <input type="number" step="0.000001" value={withRewardAbs} onChange={(e)=>setWithRewardAbs(e.target.value ? Number(e.target.value) : '')} disabled={withRemove} className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white" placeholder="예: 0.01"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">월 한도(절대값)</label>
                    <input type="number" step="1" value={withLimitAbs} onChange={(e)=>setWithLimitAbs(e.target.value ? Number(e.target.value) : '')} disabled={withRemove} className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white" placeholder="예: 2000"/>
                  </div>
                </div>
              )}
            </div>
            {/* 미리보기는 공용 영역에서 렌더링 */}
          </div>
          )}

          {/* 섹션: 리워드 없는 음원 (그룹이 있고 적용 중일 때만) */}
          {withoutRewardList.length > 0 && applyWithoutGroup && (
          <div className="p-4 border border-white/10 rounded-lg bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-teal-400 rounded"></span>
                리워드 없는 음원 ({withoutRewardList.length}개)
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">호출당 리워드</label>
                <input type="number" step="0.000001" value={withoutRpp} onChange={(e)=>setWithoutRpp(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white" placeholder="예: 0.01"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">월 한도</label>
                <input type="number" step="1" value={withoutLimitVal} onChange={(e)=>setWithoutLimitVal(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white" placeholder="예: 2000"/>
              </div>
            </div>
            {/* 미리보기는 공용 영역에서 렌더링 */}
          </div>
          )}

          {/* 공용 미리보기 섹션 */}
          {(withRewardList.length > 0 || withoutRewardList.length > 0) && (
            <div className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-teal-400 rounded"></span>
                  Preview
                </h4>
              </div>
              <div className="space-y-1 text-xs">
                {withRewardList.length > 0 && applyWithGroup && (
                  <div className="text-white/80 mb-1 font-medium">리워드 있음</div>
                )}
                {withRewardList.length > 0 && applyWithGroup && withRewardList.slice(0, previewCount).map(m => {
                  const { baseRpp, newRpp, baseLimit, newLimit } = computeWithPreview(m)
                  return (
                    <div key={`with-${m.id}`} className="flex justify-between gap-3">
                      <span className="text-white/70 truncate">{m.title}</span>
                      <span className="tabular-nums">
                        <span className="text-white/60">{formatRpp(baseRpp)}</span>
                        <span className="mx-1 text-white/40">→</span>
                        <span className="text-teal-300 font-medium">{formatRpp(newRpp)}</span>
                        <span className="mx-2 text-white/30">|</span>
                        <span className="text-white/60">{formatLimit(baseLimit)}</span>
                        <span className="mx-1 text-white/40">→</span>
                        <span className="text-teal-300 font-medium">{formatLimit(newLimit)}</span>
                      </span>
                    </div>
                  )
                })}

                {withoutRewardList.length > 0 && applyWithoutGroup && (
                  <div className="text-white/80 mt-3 mb-1 font-medium">리워드 없음</div>
                )}
                {withoutRewardList.length > 0 && applyWithoutGroup && withoutRewardList.slice(0, previewCount).map(m => {
                  const { baseRpp, newRpp, baseLimit, newLimit } = computeWithoutPreview(m)
                  return (
                    <div key={`without-${m.id}`} className="flex justify-between gap-3">
                      <span className="text-white/70 truncate">{m.title}</span>
                      <span className="tabular-nums">
                        <span className="text-white/60">{formatRpp(baseRpp)}</span>
                        <span className="mx-1 text-white/40">→</span>
                        <span className="text-teal-300 font-medium">{formatRpp(newRpp)}</span>
                        <span className="mx-2 text-white/30">|</span>
                        <span className="text-white/60">{formatLimit(baseLimit)}</span>
                        <span className="mx-1 text-white/40">→</span>
                        <span className="text-teal-300 font-medium">{formatLimit(newLimit)}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
        </div>
      )
    }

    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">일괄 리워드 수정</h2>
            <span className="text-sm text-teal-300 bg-teal-400/10 px-2 py-1 rounded-full">
              {selectedMusics.length}개 선택됨
            </span>
            {/* 단일 스텝으로 변경됨: 이전 Step 배지는 제거 */}
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

        {/* 내용 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {renderBody()}

          {/* 버튼 */}
          <div className="flex justify-between gap-3 pt-4">
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-xs font-medium text-white bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isLoading ? '처리 중...' : '일괄 수정'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

