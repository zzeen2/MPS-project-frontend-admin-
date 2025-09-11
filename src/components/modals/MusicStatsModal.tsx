'use client'
import { useState } from 'react'

type Props = { 
  open: boolean; 
  onClose: () => void; 
  title?: string;
  musicData?: {
    id?: string;
    title: string;
    artist: string;
    category?: string;
    genre?: string;
    tags?: string;
    normalizedTags?: string;
    releaseDate?: string;
    releaseYear?: number;
    durationSec?: number;
    musicType?: '일반' | 'Inst' | '가사만';
    priceMusicOnly?: number;
    priceLyricsOnly?: number;
    priceBoth?: number;
    rewardPerPlay?: number;
    maxPlayCount?: number;
    accessTier?: 'all' | 'subscribed';
    grade?: number;
    lyricist?: string;
    composer?: string;
    arranger?: string;
    isrc?: string;
    coverImageUrl?: string;
    createdAt?: string;
    lyricsText?: string;
    lyricsFilePath?: string;
  }
}

export default function MusicStatsModal({ open, onClose, title = '음원 상세', musicData }: Props) {
  const [showLyricsModal, setShowLyricsModal] = useState(false)
  
  const formatDateHyphen = (s?: string) => {
    if (!s) return '-'
    const d = new Date(s)
    if (isNaN(d.getTime())) return '-'
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  if (!open) return null
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

      <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-white/10 rounded-xl shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {musicData?.title || title}
            <span className="text-white/50 font-normal"> · </span>
            <span className="text-white/70 font-medium">{musicData?.artist || 'Unknown'}</span>
          </h2>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* 음원 정보 카드 */}
          <div className="p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
              <span className="h-4 w-1.5 rounded bg-teal-300"></span>
              음원 정보
            </h3>
            <div className="flex gap-8 items-start">
              {/* 좌측 썸네일 */}
              <div className="flex-shrink-0">
                <div className="w-64 h-64 rounded-lg border border-white/10 overflow-hidden bg-white/5">
                  {musicData?.id ? (
                    <img 
                      src={`/admin/musics/${musicData.id}/cover`} 
                      alt={`${musicData?.title || title} 커버`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        if (target.nextElementSibling) {
                          target.nextElementSibling.classList.remove('hidden')
                        }
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${musicData?.id ? 'hidden' : ''}`}>
                    <div className="text-center">
                      <svg className="w-20 h-20 mx-auto text-white/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <div className="text-xs text-white/40">음원 커버</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 우측 기본 정보 */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">제목</span>
                    <div className="text-white font-medium">{musicData?.title || '-'}</div>
                  </div>
                  <div>
                    <span className="text-white/60">아티스트</span>
                    <div className="text-white font-medium">{musicData?.artist || '-'}</div>
                  </div>
                  <div>
                    <span className="text-white/60">카테고리</span>
                    <div className="mt-1">
                      {musicData?.genre ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                          {musicData.genre}
                        </span>
                      ) : (
                        <span className="text-white/40">-</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">음원 유형</span>
                    <div className="mt-1">
                      {musicData?.musicType ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          musicData.musicType === '일반' ? 'bg-purple-500/20 text-purple-400' :
                          musicData.musicType === 'Inst' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {musicData.musicType}
                        </span>
                      ) : (
                        <span className="text-white/40">-</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">사용 가능 등급</span>
                    <div className="mt-1">
                      {musicData?.grade !== undefined ? (
                        <div className="flex flex-wrap gap-1">
                          {musicData.grade === 0 ? (
                            <>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">Free</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">Standard</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-400">Business</span>
                            </>
                          ) : musicData.grade === 1 ? (
                            <>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">Standard</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-400">Business</span>
                            </>
                          ) : musicData.grade === 2 ? (
                            <>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">Standard</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-400">Business</span>
                            </>
                          ) : (
                            <span className="text-white/40">-</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-white/40">-</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">발매일</span>
                    <div className="text-white font-medium">{formatDateHyphen(musicData?.releaseDate)}</div>
                  </div>
                  <div>
                    <span className="text-white/60">재생시간</span>
                    <div className="text-white font-medium">{formatDuration(musicData?.durationSec)}</div>
                  </div>
                  <div>
                    <span className="text-white/60">ISRC</span>
                    <div className="text-white font-medium">{musicData?.isrc || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 가격 정보 카드 */}
          <div className="p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
              <span className="h-4 w-1.5 rounded bg-teal-300"></span>
              가격 정보
            </h3>
            <div className={`grid grid-cols-1 gap-4 ${musicData?.musicType === 'Inst' ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
              {musicData?.musicType === 'Inst' ? (
                // Inst 음원: 음악만 가격만 표시
                <div className="text-center p-4 rounded-lg border border-white/10">
                  <div className="text-white/60 text-sm mb-1">음악 가격</div>
                  <div className="text-teal-400 font-medium text-sm">
                    {musicData?.priceMusicOnly ? `${musicData.priceMusicOnly}원` : '-'}
                  </div>
                </div>
              ) : (
                // 일반 음원: 음악 가격과 가사 가격 표시
                <>
                  <div className="text-center p-4 rounded-lg border border-white/10">
                    <div className="text-white/60 text-sm mb-1">음악 가격</div>
                    <div className="text-teal-400 font-medium text-sm">
                      {musicData?.priceMusicOnly ? `${musicData.priceMusicOnly}원` : '-'}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg border border-white/10">
                    <div className="text-white/60 text-sm mb-1">가사 가격</div>
                    <div className="text-teal-400 font-medium text-sm">
                      {musicData?.priceLyricsOnly ? `${musicData.priceLyricsOnly}원` : '-'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 리워드 정보 카드 */}
          <div className="p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
              <span className="h-4 w-1.5 rounded bg-teal-300"></span>
              리워드 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-white/60 text-sm">재생당 리워드</span>
                <div className="text-teal-400 font-medium text-sm">
                  {musicData?.rewardPerPlay ? `${musicData.rewardPerPlay}원` : '-'}
                </div>
              </div>
              <div>
                <span className="text-white/60 text-sm">리워드 발생 최대 재생 수</span>
                <div className="text-white font-medium text-sm">
                  {musicData?.maxPlayCount ? musicData.maxPlayCount.toLocaleString() : '-'}
                </div>
              </div>
              <div>
                <span className="text-white/60 text-sm">최대 리워드</span>
                <div className="text-teal-400 font-medium text-sm">
                  {musicData?.rewardPerPlay && musicData?.maxPlayCount 
                    ? `${(musicData.rewardPerPlay * musicData.maxPlayCount).toLocaleString()}원`
                    : musicData?.rewardPerPlay && !musicData?.maxPlayCount
                    ? '무제한'
                    : '-'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* 제작 정보 카드 */}
          <div className="p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
              <span className="h-4 w-1.5 rounded bg-teal-300"></span>
              제작 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-white/60 text-sm">작사</span>
                <div className="text-white font-medium">{musicData?.lyricist || '-'}</div>
              </div>
              <div>
                <span className="text-white/60 text-sm">작곡</span>
                <div className="text-white font-medium">{musicData?.composer || '-'}</div>
              </div>
              <div>
                <span className="text-white/60 text-sm">편곡</span>
                <div className="text-white font-medium">{musicData?.arranger || '-'}</div>
              </div>
            </div>
          </div>

          {/* 태그 정보 카드 */}
          <div className="p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
              <span className="h-4 w-1.5 rounded bg-teal-300"></span>
              태그
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-white/60 text-sm mb-2">일반 태그</div>
                <div className="flex flex-wrap gap-2">
                  {(musicData?.tags || '').split(',').map(t => t.trim()).filter(Boolean).length > 0 ? (
                    (musicData?.tags || '').split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                      <span key={`tag-${i}`} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-teal-400/20 text-teal-300">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/50 text-sm">-</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-2">정규화 태그</div>
                <div className="flex flex-wrap gap-2">
                  {(musicData?.normalizedTags || '').split(',').map(t => t.trim()).filter(Boolean).length > 0 ? (
                    (musicData?.normalizedTags || '').split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                      <span key={`ntag-${i}`} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-400/20 text-blue-300">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/50 text-sm">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 가사 정보 카드 */}
          {musicData?.musicType !== 'Inst' && (
            <div className="p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                  <span className="h-4 w-1.5 rounded bg-teal-300"></span>
                  가사
                </h3>
                {(musicData?.lyricsText && musicData.lyricsText.trim().length > 0) ? (
                  <button
                    onClick={() => setShowLyricsModal(true)}
                    className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
                  >
                    전체 보기
                  </button>
                ) : null}
              </div>
              <div className="text-white/80 text-sm leading-relaxed max-h-32 overflow-hidden whitespace-pre-line">
                {musicData?.lyricsText && musicData.lyricsText.trim().length > 0 
                  ? musicData.lyricsText 
                  : musicData?.lyricsFilePath 
                    ? (
                        <div className="flex items-center gap-2">
                          <span>가사 파일이 등록되어 있습니다.</span>
                          <a 
                            href={`/admin/musics/${musicData.id}/lyrics?mode=download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-400 hover:text-teal-300 underline text-xs"
                          >
                            다운로드
                          </a>
                        </div>
                      )
                    : '가사가 없습니다.'}
              </div>
            </div>
          )}
        </div>

        {/* 가사 모달 */}
        {showLyricsModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* 배경 오버레이 */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLyricsModal(false)}
            />
            
            {/* 가사 모달 */}
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-neutral-900 border border-white/10 rounded-xl shadow-2xl flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">
                  {musicData?.title || title} 가사
                  <span className="text-white/50 font-normal"> · </span>
                  <span className="text-white/70 font-medium">{musicData?.artist || 'Unknown'}</span>
                </h2>
                <button
                  onClick={() => setShowLyricsModal(false)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 가사 내용 */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="text-white/80 text-base leading-relaxed whitespace-pre-line">
                  {musicData?.lyricsText && musicData.lyricsText.trim().length > 0 
                    ? musicData.lyricsText 
                    : musicData?.lyricsFilePath 
                      ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>가사 파일이 등록되어 있습니다.</span>
                              <div className="flex gap-2">
                                <a 
                                  href={`/admin/musics/${musicData.id}/lyrics?mode=inline`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 underline text-sm"
                                >
                                  새 창에서 보기
                                </a>
                                <a 
                                  href={`/admin/musics/${musicData.id}/lyrics?mode=download`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-teal-400 hover:text-teal-300 underline text-sm"
                                >
                                  다운로드
                                </a>
                              </div>
                            </div>
                            <div className="text-sm text-white/60">
                              가사 파일을 보려면 위의 링크를 클릭하세요.
                            </div>
                          </div>
                        )
                      : '가사가 없습니다.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}