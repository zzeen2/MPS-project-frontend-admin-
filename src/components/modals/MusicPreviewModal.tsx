'use client'
import { useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

type Props = { 
  open: boolean; 
  onClose: () => void; 
  musicData?: {
    title: string;
    artist: string;
    genre: string;
    tags: string;
    releaseYear: number;
    durationSec: number;
    musicType?: '일반' | 'Inst';
    priceMusicOnly?: number;
    priceLyricsOnly?: number;
    priceBoth?: number;
    priceRef?: number;
    rewardPerPlay: number;
    maxPlayCount: number;
    accessTier: 'all' | 'subscribed';
    lyricsText?: string;
  }
}

type TestResult = {
  status: 'idle' | 'testing' | 'success' | 'error';
  responseTime?: number;
  message?: string;
  timestamp?: string;
}

export default function MusicPreviewModal({ open, onClose, musicData }: Props) {
  const [testResult, setTestResult] = useState<TestResult>({ status: 'idle' })

  if (!open) return null

  const totalReward = (musicData?.rewardPerPlay || 0) * (musicData?.maxPlayCount || 0)

  const runApiTest = async () => {
    setTestResult({ status: 'testing' })
    
    // 실제 API 테스트 시뮬레이션
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2 // 80% 성공률
      const responseTime = Math.floor(Math.random() * 200) + 50 // 50-250ms
      
      if (isSuccess) {
        setTestResult({
          status: 'success',
          responseTime,
          message: 'API 연결이 정상적으로 작동합니다.',
          timestamp: new Date().toLocaleTimeString()
        })
      } else {
        setTestResult({
          status: 'error',
          responseTime,
          message: '연결 실패',
          timestamp: new Date().toLocaleTimeString()
        })
      }
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-neutral-900/90 text-white shadow-2xl backdrop-blur-md max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-semibold text-white">음원 미리보기</h3>
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
        <div className="flex-1 overflow-y-auto p-6 pt-4 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
          <div className="space-y-6">
            {/* 기본 정보 섹션 */}
            <Card>
              <Title variant="section">음원 기본 정보</Title>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-teal-400/20 via-blue-400/15 to-purple-400/20 border border-white/10 flex items-center justify-center shadow-inner">
                    <span className="text-teal-300 text-2xl">🎵</span>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{musicData?.title || '-'}</div>
                    <div className="text-sm text-white/60">{musicData?.artist || '-'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                    <span className="text-sm text-white/60">장르</span>
                    <span className="text-sm font-medium text-white">{musicData?.genre || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                    <span className="text-sm text-white/60">음원 유형</span>
                    <span className="text-sm font-medium text-white">{musicData?.musicType || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                    <span className="text-sm text-white/60">태그</span>
                    <span className="text-sm font-medium text-white">{musicData?.tags || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                    <span className="text-sm text-white/60">발매년도</span>
                    <span className="text-sm font-medium text-white">{musicData?.releaseYear || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                    <span className="text-sm text-white/60">재생 시간</span>
                    <span className="text-sm font-medium text-white">{musicData?.durationSec ? `${musicData.durationSec}초` : '-'}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 가사 섹션 */}
            <Card>
              <Title variant="section">가사</Title>
              <div className="mt-4 p-4 rounded-lg bg-black/20 border border-white/5">
                <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                  {musicData?.lyricsText || '가사가 입력되지 않았습니다.'}
                </div>
              </div>
            </Card>

            {/* 가격 및 리워드 설정 섹션 */}
            <Card>
              <Title variant="section">가격 및 리워드 설정</Title>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                  <span className="text-sm text-white/60">음원만 이용시</span>
                  <span className="text-sm font-medium text-white">{musicData?.priceMusicOnly ? `${musicData.priceMusicOnly}원` : '-'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                  <span className="text-sm text-white/60">가사만 이용시</span>
                  <span className="text-sm font-medium text-white">{musicData?.priceLyricsOnly ? `${musicData.priceLyricsOnly}원` : '-'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                  <span className="text-sm text-white/60">둘다 이용시</span>
                  <span className="text-sm font-medium text-white">{musicData?.priceBoth ? `${musicData.priceBoth}원` : '-'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                  <span className="text-sm text-white/60">1회 재생당 리워드</span>
                  <span className="text-sm font-medium text-white">{musicData?.rewardPerPlay ? `${musicData.rewardPerPlay} 토큰` : '-'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                  <span className="text-sm text-white/60">최대 재생 횟수</span>
                  <span className="text-sm font-medium text-white">{musicData?.maxPlayCount ? `${musicData.maxPlayCount}회` : '-'}</span>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-teal-500/10 border border-teal-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-teal-300">예상 총 리워드</span>
                  <span className="text-lg font-semibold text-teal-300">{totalReward.toFixed(3)} 토큰</span>
                </div>
              </div>
            </Card>

            {/* API 설정 섹션 */}
            <Card>
              <Title variant="section">API 설정</Title>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                  <span className="text-sm text-white/60">엔드포인트 URL</span>
                  <span className="text-sm font-medium text-white/60">/api/music/{'{music_id}'}/play</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                  <span className="text-sm text-white/60">API 키 권한</span>
                  <span className="text-sm font-medium text-white">
                    {musicData?.accessTier === 'all' ? '모든 기업 (무료)' : '구독 기업만'}
                  </span>
                </div>
              </div>
              
              {/* API 테스트 결과 */}
              <div className="mt-4 p-4 rounded-lg bg-black/20 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">API 테스트 결과</span>
                  {testResult.status === 'testing' && (
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      테스트 중...
                    </div>
                  )}
                </div>
                
                {testResult.status === 'idle' && (
                  <div className="text-sm text-white/60">API 테스트를 실행해주세요.</div>
                )}
                
                {testResult.status === 'success' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      테스트 성공
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-white/60">응답 시간:</span>
                        <span className="ml-2 text-white">{testResult.responseTime}ms</span>
                      </div>
                      <div>
                        <span className="text-white/60">테스트 시간:</span>
                        <span className="ml-2 text-white">{testResult.timestamp}</span>
                      </div>
                    </div>
                    <div className="text-sm text-white/80">{testResult.message}</div>
                  </div>
                )}
                
                {testResult.status === 'error' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-red-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      테스트 실패
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-white/60">응답 시간:</span>
                        <span className="ml-2 text-white">{testResult.responseTime}ms</span>
                      </div>
                      <div>
                        <span className="text-white/60">테스트 시간:</span>
                        <span className="ml-2 text-white">{testResult.timestamp}</span>
                      </div>
                    </div>
                    <div className="text-sm text-white/80">{testResult.message}</div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-white/10">
          <button 
            onClick={runApiTest}
            disabled={testResult.status === 'testing'}
            className={`rounded px-4 py-2 text-sm text-white transition-all duration-200 ${
              testResult.status === 'testing' 
                ? 'bg-blue-600/50 cursor-not-allowed' 
                : 'bg-blue-600/90 hover:bg-blue-500'
            }`}
          >
            {testResult.status === 'testing' ? '테스트 중...' : 'API 테스트'}
          </button>
          <button 
            onClick={() => {
              alert('음원 등록을 진행합니다.')
              onClose()
            }}
            className="rounded bg-teal-600/90 px-4 py-2 text-sm text-white hover:bg-teal-500 transition-all duration-200"
          >
            음원 등록
          </button>
        </div>
      </div>
    </div>
  )
} 