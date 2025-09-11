'use client'
import React, { useState } from 'react'

type Music = {
  id: string
  title: string
  category: string
  rewardPerPlay: number
  totalRewardCount: number | null
  status: 'active' | 'inactive'
}

interface RewardEditModalProps {
  open: boolean
  onClose: () => void
  music: Music | null
  onSuccess?: () => void
}

export default function RewardEditModal({ open, onClose, music, onSuccess }: RewardEditModalProps) {
  const [rewardPerPlay, setRewardPerPlay] = useState(music?.rewardPerPlay || 0)
  const [totalRewardCount, setTotalRewardCount] = useState<number | ''>(music?.totalRewardCount || '')
  const [isLoading, setIsLoading] = useState(false)
  const [removeReward, setRemoveReward] = useState(false)
  const [grade, setGrade] = useState<0 | 2>(0)

  // 모달이 열릴 때 초기값 설정
  React.useEffect(() => {
    if (open && music) {
      setRewardPerPlay(music.rewardPerPlay || 0)
      setTotalRewardCount(music.totalRewardCount || '')
      setRemoveReward(false)
      setGrade(0)
      console.log('모달 초기값 설정:', {
        rewardPerPlay: music.rewardPerPlay,
        totalRewardCount: music.totalRewardCount,
        music: music
      })
    }
  }, [open, music])

  if (!open || !music) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const requestData = {
      totalRewardCount: removeReward ? 0 : (totalRewardCount || 0),
      rewardPerPlay: removeReward ? 0 : rewardPerPlay,
      removeReward: removeReward,
      grade: removeReward ? grade : undefined,
    }
    
    console.log('리워드 수정 요청 데이터:', requestData)
    console.log('API URL:', `/admin/musics/${music.id}/rewards`)
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/admin/musics/${music.id}/rewards`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('리워드 수정 성공:', result)
      
      // 성공 시 콜백 실행 (페이지 새로고침)
      if (onSuccess) {
        onSuccess()
      }
      
      // 모달 닫기
      onClose()
    } catch (error) {
      console.error('리워드 수정 실패:', error)
      alert('리워드 수정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">리워드 수정</h2>
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
          {/* 음원 정보 */}
          <div className="space-y-3">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="font-semibold text-white text-lg">{music.title}</h3>
              <p className="text-sm text-white/60 mt-1">{music.category}</p>
            </div>
          </div>

          {/* 리워드 제거 옵션 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="removeReward"
                checked={removeReward}
                onChange={(e) => setRemoveReward(e.target.checked)}
                className="w-4 h-4 text-teal-400 bg-white/5 border-white/20 rounded focus:ring-teal-400 focus:ring-2"
              />
              <label htmlFor="removeReward" className="text-sm font-medium text-white/80">
                리워드 제거
              </label>
            </div>

            {removeReward && (
              <div className="ml-7 space-y-3">
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
            )}
          </div>

          {/* 리워드 설정 */}
          {!removeReward && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    1회 재생당 리워드 (토큰) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={rewardPerPlay}
                      onChange={(e) => setRewardPerPlay(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
                      placeholder="0.000"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
                      토큰
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    현재: {music.rewardPerPlay.toFixed(3)} 토큰
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    총 리워드 수량 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalRewardCount}
                    onChange={(e) => setTotalRewardCount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
                    placeholder="1000"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    현재: {music.totalRewardCount ? music.totalRewardCount.toLocaleString() : '0'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 리워드 미리보기 */}
          {!removeReward && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <h4 className="text-sm font-medium text-white/80 mb-2">리워드 미리보기</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">100회 호출 시:</span>
                  <span className="text-white font-medium">{(rewardPerPlay * 100).toFixed(1)} 토큰</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">1,000회 호출 시:</span>
                  <span className="text-white font-medium">{(rewardPerPlay * 1000).toFixed(1)} 토큰</span>
                </div>
                {totalRewardCount && (
                  <div className="flex justify-between">
                    <span className="text-white/70">총 리워드 수량:</span>
                    <span className="text-white font-medium">{totalRewardCount.toLocaleString()} 토큰</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || (rewardPerPlay === music.rewardPerPlay && totalRewardCount === music.totalRewardCount)}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-teal-500/90 rounded-lg hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  수정 중...
                </div>
              ) : (
                '리워드 수정'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 