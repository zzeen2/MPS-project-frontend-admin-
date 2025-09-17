'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import DailyTxDetailModal from '@/components/modals/DailyTxDetailModal'
import PieCompanyDistribution from '@/components/charts/PieCompanyDistribution'

// 트랜잭션 타입 정의
type TransactionType = 'token-distribution' | 'api-recording'

type Transaction = {
  id: string
  type: TransactionType
  timestamp: string
  blockchainRecordedAt?: string
  txHash: string
  status: 'success' | 'pending' | 'failed'
  blockNumber: number | null
  gasUsed: number | null
  gasPrice: number | null

  // 토큰 분배 트랜잭션 데이터
  tokenDistribution?: {
    totalAmount: number
    recipientCount: number
    recipients: Array<{
      company: string
      amount: number
    }>
  }

  // API 호출 기록 트랜잭션 데이터
  apiRecording?: {
    recordCount: number
    records: Array<{
      companyId: number
      companyName?: string
      musicId: number
      musicTitle?: string
      playId: number
      rewardCode: number
      timestamp: string
    }>
  }
}

export default function RewardsTokensPage() {

  // 토큰 정보
  const [tokenInfo, setTokenInfo] = useState({
    contractAddress: '',
    totalSupply: 0,
    totalIssued: 0,
    totalBurned: 0,
    circulatingSupply: 0,
    tokenName: '',
    tokenSymbol: '',
    decimals: 18
  })

  // 대납자 지갑 정보
  const [sponsorWallet, setSponsorWallet] = useState({
    address: '',
    ethBalance: 0,
    lastUpdated: ''
  })

  // 트랜잭션 데이터
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionDetail, setTransactionDetail] = useState<Transaction | null>(null)

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  const [isProcessingToday, setIsProcessingToday] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 수동 배치 실행 상태
  const [manualDate, setManualDate] = useState('')
  const [manualProcessing, setManualProcessing] = useState(false)
  const [manualMessage, setManualMessage] = useState<string | null>(null)

  // 마지막 새로고침 시간
  const [lastRefreshTime, setLastRefreshTime] = useState<string | null>(null)

  // API 호출 함수들
  const fetchTokenInfo = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${baseUrl}/admin/tokens/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })

      console.log('토큰 정보 응답:', response)

      clearTimeout(timeoutId)
      if (response.ok) {
        const data = await response.json()
        setTokenInfo(data)
      } else {
        console.error('토큰 정보 조회 실패:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('토큰 정보 조회 실패:', error)
    }
  }

  const fetchWalletInfo = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/admin/tokens/wallet`)
      if (response.ok) {
        const data = await response.json()
        setSponsorWallet(data)
      }
    } catch (error) {
      console.error('지갑 정보 조회 실패:', error)
      // 실패 시 더미 데이터 표시하지 않음
    }
  }

  const fetchTransactions = async (page: number = currentPage, refresh: boolean = false) => {
    try {
      if (refresh) setIsRefreshing(true)

      const offset = (page - 1) * itemsPerPage
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/admin/tokens/transactions?limit=${itemsPerPage}&offset=${offset}`)

      if (response.ok) {
        const data = await response.json()
        // 정규화: 시간은 blockchain_recorded_at 우선, 타입은 payload 기반 보정
        const normalized: Transaction[] = (Array.isArray(data) ? data : []).map((t: any) => {
          const hasTokenDist = !!t.tokenDistribution && (t.tokenDistribution.recipientCount ?? 0) > 0
          const inferredType: TransactionType = t.type
            || (hasTokenDist ? 'token-distribution' : 'api-recording')
          return {
            id: String(t.id ?? t.txId ?? t.hash ?? Math.random()),
            type: inferredType,
            timestamp: String(t.blockchainRecordedAt ?? t.blockchain_recorded_at ?? t.timestamp ?? ''),
            blockchainRecordedAt: String(t.blockchainRecordedAt ?? t.blockchain_recorded_at ?? ''),
            txHash: String(t.txHash ?? t.hash ?? ''),
            status: (t.status ?? 'pending') as any,
            blockNumber: t.blockNumber ?? null,
            gasUsed: t.gasUsed ?? null,
            gasPrice: t.gasPrice ?? null,
            tokenDistribution: t.tokenDistribution,
            apiRecording: t.apiRecording,
          }
        })
        setTransactions(normalized)

        // 페이지네이션 정보 업데이트 (실제 API에서 totalCount를 반환한다고 가정)
        const estimatedTotal = data.length === itemsPerPage ? page * itemsPerPage + 1 : page * itemsPerPage
        setTotalCount(estimatedTotal)
        setTotalPages(Math.ceil(estimatedTotal / itemsPerPage))
      } else {
        console.error('트랜잭션 조회 실패:', response.status)
        setTransactions([])
      }
    } catch (error) {
      console.error('트랜잭션 조회 실패:', error)
      setTransactions([])
    } finally {
      if (refresh) setIsRefreshing(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchTokenInfo(),
        fetchWalletInfo(),
        fetchTransactions(1)
      ])
      setLoading(false)
      // 초기 로드 시에도 시간 설정
      setLastRefreshTime(new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))
    }
    loadData()
  }, [])

  // 자동 새로고침 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTransactions(currentPage, true)
      setLastRefreshTime(new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))
    }, 30000) // 30초마다 새로고침

    return () => clearInterval(interval)
  }, [currentPage])

  // 페이지 변경 시 트랜잭션 데이터 로드
  useEffect(() => {
    if (currentPage > 1) {
      fetchTransactions(currentPage)
    }
  }, [currentPage])

  const handleProcessToday = async () => {
    if (isProcessingToday) return
    setIsProcessingToday(true)
    try {
      // TODO: API 호출 -> 금일 유효재생 묶음 트랜잭션 실행 & 리워드 토큰 발행/배포
      await new Promise(r => setTimeout(r, 1500))
    } catch (e) {
      console.error('금일 처리 실패', e)
    } finally {
      setIsProcessingToday(false)
    }
  }

  // 수동 집계 & 트랜잭션 실행 (backend test/manual-batch 사용)
  const runManualBatch = async () => {
    if (manualProcessing) return
    setManualProcessing(true)
    setManualMessage(null)
    try {
      // 미래 날짜 검증 (입력 날짜가 오늘보다 크면 중단)
      if (manualDate) {
        const today = new Date();
        const input = new Date(manualDate + 'T00:00:00');
        // 날짜 비교 시 로컬 자정 기준으로만 비교 (시간대 차이 최소화)
        const ymd = (d: Date) => [d.getFullYear(), d.getMonth(), d.getDate()].join('-');
        const todayKey = ymd(today);
        const inputKey = ymd(input);
        if (input > today && inputKey !== todayKey) {
          setManualMessage('과거 시간을 입력해주세요.');
          return;
        }
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      // 날짜 입력(YYYY-MM-DD)을 ISO(+09:00)로 변환
      const payload: any = {}
      if (manualDate) {
        payload.targetDate = `${manualDate}T00:00:00+09:00`
      }
      const res = await fetch(`${baseUrl}/test/manual-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data && data.success === true) {
        const total = data.total ?? data.count ?? 0
        const created = data.created ?? data.processed ?? data.inserted ?? undefined
        const updated = data.updated ?? undefined
        const failed = data.failed ?? data.errors ?? undefined
        if (total === 0) {
          setManualMessage('처리할 데이터가 없습니다.')
        } else {
          const parts: string[] = []
          parts.push(`총 ${total.toLocaleString()}건 처리 완료`)
          if (created !== undefined) parts.push(`신규 ${created.toLocaleString()}건`)
          if (updated !== undefined) parts.push(`갱신 ${updated.toLocaleString()}건`)
          if (failed !== undefined && failed > 0) parts.push(`실패 ${failed.toLocaleString()}건`)
          setManualMessage(parts.join(' · '))
        }
      } else {
        const msg = (data && (data.message || data.error)) || '실패했습니다. 잠시 후 다시 시도해주세요.'
        setManualMessage(msg)
      }
      // 필요시 실행 후 트랜잭션 목록 새로고침
      fetchTransactions(1, true)
    } catch (e: any) {
      console.error('수동 실행 실패', e)
      setManualMessage(`실패: ${e.message || e}`)
    } finally {
      setManualProcessing(false)
    }
  }

  const handleRefreshWallet = async () => {
    await fetchWalletInfo()
  }

  const handleRefreshTransactions = async () => {
    await fetchTransactions(currentPage, true)
    setLastRefreshTime(new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }))
  }

  const fetchTransactionDetail = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/admin/tokens/transactions/${id}`)
      if (response.ok) {
        let data: any = null
        try {
          data = await response.json()
        } catch (e) {
          console.warn('빈 응답 또는 JSON 파싱 실패, data=null 처리', e)
        }
        if (!data) {
          setTransactionDetail(null)
          return
        }
        const hasTokenDist = !!data?.tokenDistribution && (data?.tokenDistribution?.recipientCount ?? 0) > 0
        const inferredType: TransactionType = data?.type || (hasTokenDist ? 'token-distribution' : 'api-recording')
        console.log('🔍 TransactionDetail 데이터:', data)
        console.log('🔍 tokenDistribution:', data.tokenDistribution)
        console.log('🔍 recipients:', data.tokenDistribution?.recipients)
        
        setTransactionDetail({
          id: String(data.id ?? id),
          type: inferredType,
          timestamp: String(data.blockchainRecordedAt ?? data.blockchain_recorded_at ?? data.timestamp ?? ''),
          blockchainRecordedAt: String(data.blockchainRecordedAt ?? data.blockchain_recorded_at ?? ''),
          txHash: String(data.txHash ?? data.hash ?? ''),
          status: (data.status ?? 'pending') as any,
          blockNumber: data.blockNumber ?? null,
          gasUsed: data.gasUsed ?? null,
          gasPrice: data.gasPrice ?? null,
          tokenDistribution: data.tokenDistribution,
          apiRecording: data.apiRecording,
        })
      } else {
        if (response.status === 404) {
          console.error('트랜잭션을 찾을 수 없음 (404)')
        } else {
          console.error('트랜잭션 상세 조회 실패:', response.status)
        }
        setTransactionDetail(null)
      }
    } catch (error) {
      console.error('트랜잭션 상세 조회 실패:', error)
      setTransactionDetail(null)
    }
  }

  // 트랜잭션 타입별 표시 함수들
  const getTransactionTypeText = (type: TransactionType) => {
    switch (type) {
      case 'token-distribution':
        return '리워드 지급'
      case 'api-recording':
        return '유효재생 기록'
      default:
        return type
    }
  }

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case 'token-distribution':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'api-recording':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default:
        return 'bg-white/10 text-white/80 border-white/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-white/60'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'pending':
        return '⏳'
      case 'failed':
        return '❌'
      default:
        return '❓'
    }
  }


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Title variant="section">토큰/온체인 관리</Title>
          <div className="text-sm text-white/60">
            블록체인 연동 상태: <span className="text-yellow-400 font-semibold">연결 중...</span>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">데이터를 불러오는 중...</div>
        </div>
      </div>
    )
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

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Title variant="section">토큰/온체인 관리</Title>
          <div className="text-sm text-white/60">
            블록체인 연동 상태: <span className="text-green-400 font-semibold">연결됨</span>
          </div>
        </div>

        {/* 토큰 기본 정보 + 대납자 지갑 + 처리 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <Title variant="card">ERC20 토큰 정보</Title>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">컨트랙트 주소:</span>
                <span className="text-white font-mono">{tokenInfo.contractAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">총 발행량:</span>
                <span className="text-white font-semibold">{tokenInfo.totalIssued.toLocaleString()} 토큰</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">현재 유통량:</span>
                <span className="text-teal-300 font-semibold">{tokenInfo.circulatingSupply.toLocaleString()} 토큰</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">소각된 토큰:</span>
                <span className="text-red-400 font-semibold">{tokenInfo.totalBurned.toLocaleString()} 토큰</span>
              </div>
            </div>
          </Card>

          <Card>
            <Title variant="card">대납자 지갑 정보</Title>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">지갑 주소:</span>
                <span className="text-white font-mono">{sponsorWallet.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">ETH 잔액:</span>
                <span className="text-teal-300 font-semibold">{sponsorWallet.ethBalance.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">마지막 업데이트:</span>
                <span className="text-white/70">{sponsorWallet.lastUpdated ? new Date(sponsorWallet.lastUpdated).toLocaleString() : '-'}</span>
              </div>
              <div className="pt-1">
                <button
                  onClick={handleRefreshWallet}
                  className="w-full rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-xs text-white/80 transition"
                >
                  잔액 새로고침
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <Title variant="card">수동 트랜잭션 실행</Title>
            <div className="mt-4 space-y-5 text-sm">

              {/* 날짜 선택 */}
              <div className="space-y-2">
                <label className="flex flex-col gap-2">
                  <input
                    type="date"
                    value={manualDate}
                    placeholder='날짜 선택 (미지정 시 금일 데이터 처리)'
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </label>
                <div className="text-[11px] text-white/40 leading-relaxed">
                  • 일자 미지정 시 금일 현재까지 누적된 데이터를 기록합니다.<br />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={runManualBatch}
                  disabled={manualProcessing}
                  className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-sm text-white font-medium hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 transition"
                >
                  {manualProcessing
                    ? '실행 중...'
                    : manualDate
                      ? `${manualDate} 트랜잭션 재실행`
                      : '금일 사용내역 기록'}
                </button>
                {manualMessage && (
                  <div className="text-xs text-white/60 whitespace-pre-line">
                    {manualMessage}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 트랜잭션 모니터링 (일별 집계) */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title variant="card">트랜잭션 모니터링</Title>
            <div className="flex items-center gap-2">
              {lastRefreshTime && (
                <div className="text-xs text-white/50">
                  마지막 업데이트: {lastRefreshTime}
                </div>
              )}
              <button
                onClick={handleRefreshTransactions}
                disabled={isRefreshing}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefreshing ? '새로고침 중...' : '새로고침'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm">
              <thead className="text-center">
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-center">시간</th>
                  <th className="px-6 py-4 text-center">타입</th>
                  <th className="px-6 py-4 text-center">내용</th>
                  <th className="px-6 py-4 text-center">이벤트 수</th>
                  <th className="px-6 py-4 text-center">Tx Hash</th>
                  <th className="px-6 py-4 text-center">블록</th>
                  <th className="px-6 py-4 text-center">가스비</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const getContentText = () => {
                    if (tx.type === 'token-distribution' && tx.tokenDistribution) {
                      return `${tx.tokenDistribution.recipientCount}개 기업, ${tx.tokenDistribution.totalAmount.toLocaleString()} 토큰`
                    } else if (tx.type === 'api-recording' && tx.apiRecording) {
                      return `${tx.apiRecording.recordCount} API 호출 기록`
                    }
                    return '-'
                  }

                  const getEventCount = () => {
                    if (tx.type === 'token-distribution' && tx.tokenDistribution) {
                      return `${tx.tokenDistribution.recipientCount} Transfer`
                    } else if (tx.type === 'api-recording' && tx.apiRecording) {
                      return `${tx.apiRecording.recordCount} PlayRecorded`
                    }
                    return '0개'
                  }

                  return (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer" onClick={() => {
                      setSelectedTransaction(tx)
                      fetchTransactionDetail(tx.id)
                    }}>
                      <td className="px-6 py-4 text-center font-mono text-xs text-white/80">
                        {(() => {
                          const date = new Date(tx.blockchainRecordedAt || tx.timestamp)
                          const year = date.getFullYear().toString().slice(-2)
                          const month = String(date.getMonth() + 1).padStart(2, '0')
                          const day = String(date.getDate()).padStart(2, '0')
                          const hours = String(date.getHours()).padStart(2, '0')
                          const minutes = String(date.getMinutes()).padStart(2, '0')
                          const seconds = String(date.getSeconds()).padStart(2, '0')
                          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
                        })()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTransactionTypeColor(tx.type)}`}>
                          {getTransactionTypeText(tx.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-white/80 text-xs">{getContentText()}</td>
                      <td className="px-6 py-4 text-center text-xs text-teal-300/70">{getEventCount()}</td>
                      <td className="px-6 py-4 text-center font-mono text-xs text-white/60">{tx.txHash}</td>
                      <td className="px-6 py-4 text-center text-white/60 text-xs">{tx.blockNumber ? tx.blockNumber.toLocaleString() : '-'}</td>
                      <td className="px-6 py-4 text-center text-white/60 text-xs">
                        {tx.gasUsed ? `${tx.gasUsed.toLocaleString()} gas` : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7" />
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
          )}
        </Card>

        {/* 트랜잭션 타입별 상세 모달 */}
        {selectedTransaction && transactionDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl bg-neutral-900 border border-white/10">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    트랜잭션 상세
                    <span className="text-white/50 font-normal"> · </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium border ${getTransactionTypeColor(transactionDetail.type)}`}>
                      {getTransactionTypeText(transactionDetail.type)}
                    </span>
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedTransaction(null);
                    setTransactionDetail(null);
                  }}
                  className="rounded-lg bg-white/10 p-2 text-white/60 hover:bg-white/20 hover:text-white transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 컨텐츠 */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                {/* 기본 정보 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                      <span className="h-4 w-1.5 rounded bg-teal-300"></span>
                      트랜잭션 정보
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">시간:</span>
                        <span className="text-white text-sm">
                          {(() => {
                            const src = transactionDetail.blockchainRecordedAt || transactionDetail.timestamp
                            const base = new Date(src)
                            const shifted = new Date(base.getTime() + 9 * 60 * 60 * 1000)
                            // UTC 기준으로 출력해 이중 오프셋을 방지
                            const yy = String(shifted.getUTCFullYear()).slice(-2)
                            const mm = String(shifted.getUTCMonth() + 1).padStart(2, '0')
                            const dd = String(shifted.getUTCDate()).padStart(2, '0')
                            const hh = String(shifted.getUTCHours()).padStart(2, '0')
                            const mi = String(shifted.getUTCMinutes()).padStart(2, '0')
                            const ss = String(shifted.getUTCSeconds()).padStart(2, '0')
                            return `${yy}-${mm}-${dd} ${hh}:${mi}:${ss}`
                          })()}
                        </span>
                      </div>
                      {transactionDetail.blockNumber && (
                        <div className="flex justify-between items-center">
                          <span className="text-white/60 text-sm">블록 번호:</span>
                          <span className="text-white text-sm">{transactionDetail.blockNumber.toLocaleString()}</span>
                        </div>
                      )}
                      {transactionDetail.gasUsed && (
                        <div className="flex justify-between items-center">
                          <span className="text-white/60 text-sm">가스 사용량:</span>
                          <span className="text-white text-sm">{transactionDetail.gasUsed.toLocaleString()} gas</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                      <span className="h-4 w-1.5 rounded bg-teal-300"></span>
                      해시 정보
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <span className="text-white/60">Tx Hash:</span>
                        <span className="font-mono break-all">{transactionDetail.txHash}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <span className="text-white/60">이벤트 수:</span>
                        <span>{transactionDetail.type === 'token-distribution' ? `${transactionDetail.tokenDistribution?.recipientCount ?? 0}개 Transfer` : `${transactionDetail.apiRecording?.recordCount ?? 0}개 PlayRecorded`}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 토큰 분배 상세 */}
                {transactionDetail.type === 'token-distribution' && transactionDetail.tokenDistribution && (
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10 min-h-[360px]">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                      <span className="h-4 w-1.5 rounded bg-teal-300"></span>
                      토큰 분배 내역
                    </h3>

                    {/* 요약 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <div className="text-white/60 text-sm mb-1">총 분배량</div>
                        <div className="text-white font-semibold text-lg">{transactionDetail.tokenDistribution.totalAmount.toLocaleString()} 토큰</div>
                      </div>
                      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <div className="text-white/60 text-sm mb-1">수혜 기업 수</div>
                        <div className="text-white font-semibold text-lg">{transactionDetail.tokenDistribution.recipientCount}개</div>
                      </div>
                    </div>

                    {/* 기업별 분배 파이차트 + 범례 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      <div className="lg:col-span-2 bg-black/20 rounded-lg p-4 border border-white/10">
                        <PieCompanyDistribution
                          items={transactionDetail.tokenDistribution.recipients.map(r => ({ label: r.company, value: r.amount }))}
                        />
                      </div>
                      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <h5 className="text-white/70 text-sm mb-3">범례</h5>
                        <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                          {transactionDetail.tokenDistribution.recipients.map((r, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: ['#10b981', '#60a5fa', '#f59e0b', '#f87171', '#a78bfa', '#34d399', '#fb7185', '#22d3ee', '#fbbf24', '#93c5fd'][idx % 10] }} />
                                <span className="text-white/80 truncate" title={r.company}>{r.company}</span>
                              </div>
                              <span className="text-white/60 font-mono">{r.amount.toLocaleString()} 토큰</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* API 호출 기록 상세 (컴팩트 테이블) */}
                {transactionDetail.type === 'api-recording' && transactionDetail.apiRecording && (
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                      <span className="h-4 w-1.5 rounded bg-teal-300"></span>
                      사용 기록 상세
                    </h3>

                    {/* 요약 정보 제거 (요청 사항: 해시 정보 카드로 이동) */}

                    {/* 호출 기록 상세 */}
                    <div>
                      {/* <h4 className="text-white/80 font-medium mb-3">사용 기록 상세</h4> */}
                      <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
                        <table className="w-full text-xs">
                          <thead className="bg-neutral-900/60 text-white/60">
                            <tr className="border-b border-white/10">
                              <th className="py-2.5 px-3 text-center">시간</th>
                              <th className="py-2.5 px-3 text-center">기업 (기업 아이디)</th>
                              <th className="py-2.5 px-3 text-center">음원 (음원 아이디)</th>
                              <th className="py-2.5 px-3 text-center">사용 형태</th>
                              <th className="py-2.5 px-3 text-center">리워드 코드</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactionDetail.apiRecording.records
                              .slice()
                              .sort((a, b) => {
                                const ta = new Date(a.timestamp).getTime()
                                const tb = new Date(b.timestamp).getTime()
                                return ta - tb
                              })
                              .map((record, index) => {
                                // +9h 표시
                                const base = new Date(record.timestamp)
                                const local = new Date(base.getTime() + 9 * 60 * 60 * 1000)
                                const yy = String(local.getFullYear()).slice(-2)
                                const mm = String(local.getMonth() + 1).padStart(2, '0')
                                const dd = String(local.getDate()).padStart(2, '0')
                                const hh = String(local.getHours()).padStart(2, '0')
                                const mi = String(local.getMinutes()).padStart(2, '0')
                                const ss = String(local.getSeconds()).padStart(2, '0')
                                const timeStr = `${yy}-${mm}-${dd} ${hh}:${mi}:${ss}`

                                const code = record.rewardCode ?? 0
                                const codeClass = code === 1
                                  ? 'text-green-400'
                                  : (code === 2 || code === 3)
                                    ? 'text-red-400'
                                    : 'text-white/50'
                                return (
                                  <tr key={index} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                                    <td className="py-2 px-3 font-mono text-white/70 whitespace-nowrap text-center">{timeStr}</td>
                                    <td className="py-2 px-3 text-white/80 whitespace-nowrap text-center">{record.companyName ? `${record.companyName} (${record.companyId})` : `- (${record.companyId})`}</td>
                                    <td className="py-2 px-3 text-white whitespace-nowrap text-center">{record.musicTitle ? `${record.musicTitle} (${record.musicId})` : `- (${record.musicId})`}</td>
                                    <td className="py-2 px-3 whitespace-nowrap text-center">
                                      {(() => {
                                        const uc = (record as any).useCase as number | undefined
                                        const label = uc === 1 ? 'Inst' : uc === 2 ? 'lyric' : 'full'
                                        const cls = uc === 1 ? 'text-pink-300' : uc === 2 ? 'text-purple-300' : 'text-teal-300'
                                        return <span className={`text-xs font-medium ${cls}`}>{label}</span>
                                      })()}
                                    </td>
                                    <td className={`py-2 px-3 font-mono whitespace-nowrap text-center ${codeClass}`}>{code}</td>
                                  </tr>
                                )
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
