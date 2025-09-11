'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import DailyTxDetailModal from '@/components/modals/DailyTxDetailModal'

// 트랜잭션 타입 정의
type TransactionType = 'token-distribution' | 'api-recording'

type Transaction = {
  id: string
  type: TransactionType
  timestamp: string
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
      musicId: number
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

  // API 호출 함수들
  const fetchTokenInfo = async () => {
    try {
      const response = await fetch('/api/admin/tokens/info')
      if (response.ok) {
        const data = await response.json()
        setTokenInfo(data)
      }
    } catch (error) {
      console.error('토큰 정보 조회 실패:', error)
    }
  }

  const fetchWalletInfo = async () => {
    try {
      const response = await fetch('/api/admin/tokens/wallet')
      if (response.ok) {
        const data = await response.json()
        setSponsorWallet(data)
      }
    } catch (error) {
      console.error('지갑 정보 조회 실패:', error)
    }
  }

  const fetchTransactions = async (page: number = currentPage, refresh: boolean = false) => {
    try {
      if (refresh) setIsRefreshing(true)
      
      const offset = (page - 1) * itemsPerPage
      const response = await fetch(`/api/admin/tokens/transactions?limit=${itemsPerPage}&offset=${offset}`)
      
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
        
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
    }
    loadData()
  }, [])

  // 자동 새로고침 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTransactions(currentPage, true)
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

  const handleRefreshWallet = async () => {
    await fetchWalletInfo()
  }

  const handleRefreshTransactions = async () => {
    await fetchTransactions(currentPage, true)
  }

  const fetchTransactionDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/tokens/transactions/${id}`)
      if (response.ok) {
        const data = await response.json()
        setTransactionDetail(data)
      } else {
        console.error('트랜잭션 상세 조회 실패:', response.status)
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
        return '토큰 분배'
      case 'api-recording':
        return 'API 호출 기록'
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
          <Title variant="card">금일 데이터 처리</Title>
          <div className="mt-4 space-y-4 text-sm">
            <p className="text-white/70 leading-relaxed">
              금일 00:00 ~ 현재까지 수집된 유효재생/리워드 적립 내역을 즉시 집계하여 온체인에 기록하고 리워드 토큰을 발행/배포합니다.
            </p>
            <button
              onClick={handleProcessToday}
              disabled={isProcessingToday}
              className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-sm text-white font-medium hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 transition"
            >
              {isProcessingToday ? '처리중...' : '금일 트랜잭션 내역 즉시 처리'}
            </button>
            <div className="text-xs text-white/40">* 기본 스케줄은 자정 기준 자동 처리됩니다.</div>
          </div>
        </Card>
      </div>

      {/* 트랜잭션 모니터링 (일별 집계) */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title variant="card">트랜잭션 모니터링</Title>
          <div className="flex gap-2">
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
                <th className="px-6 py-4 text-center">상태</th>
                <th className="px-6 py-4 text-center">가스비</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => {
                const getContentText = () => {
                  if (tx.type === 'token-distribution' && tx.tokenDistribution) {
                    return `${tx.tokenDistribution.recipientCount}개 기업, ${tx.tokenDistribution.totalAmount.toLocaleString()} 토큰`
                  } else if (tx.type === 'api-recording' && tx.apiRecording) {
                    return `${tx.apiRecording.recordCount}개 API 호출 기록`
                  }
                  return '-'
                }

                const getEventCount = () => {
                  if (tx.type === 'token-distribution' && tx.tokenDistribution) {
                    return `${tx.tokenDistribution.recipientCount}개 Transfer`
                  } else if (tx.type === 'api-recording' && tx.apiRecording) {
                    return `${tx.apiRecording.recordCount}개 PlayRecorded`
                  }
                  return '0개'
                }

                return (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer" onClick={() => {
                    setSelectedTransaction(tx)
                    fetchTransactionDetail(tx.id)
                  }}>
                    <td className="px-6 py-4 text-center font-mono text-xs text-white/80">{tx.timestamp}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTransactionTypeColor(tx.type)}`}>
                        {getTransactionTypeText(tx.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-white/80 text-xs">{getContentText()}</td>
                    <td className="px-6 py-4 text-center text-xs text-teal-300/70">{getEventCount()}</td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-white/60">{tx.txHash}</td>
                    <td className="px-6 py-4 text-center text-white/60 text-xs">{tx.blockNumber ? tx.blockNumber.toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)} {tx.status === 'success' ? '성공' : tx.status === 'pending' ? '대기' : '실패'}
                      </span>
                    </td>
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
                      <span className="text-white/60 text-sm">상태:</span>
                      <span className={`text-sm font-medium ${getStatusColor(transactionDetail.status)}`}>
                        {getStatusIcon(transactionDetail.status)} {transactionDetail.status === 'success' ? '성공' : transactionDetail.status === 'pending' ? '대기' : '실패'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">시간:</span>
                      <span className="text-white text-sm">{transactionDetail.timestamp}</span>
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
                    <div>
                      <span className="text-white/60 text-sm block mb-2">Tx Hash:</span>
                      <div className="font-mono text-white text-sm break-all bg-black/20 rounded-lg p-2 border border-white/10">
                        {transactionDetail.txHash}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 토큰 분배 상세 */}
              {transactionDetail.type === 'token-distribution' && transactionDetail.tokenDistribution && (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
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

                  {/* 기업별 분배 내역 */}
                  <div>
                    <h4 className="text-white/80 font-medium mb-4">기업별 분배 내역</h4>
                    <div className="space-y-2">
                      {transactionDetail.tokenDistribution.recipients.map((recipient, index) => (
                        <div key={index} className="flex justify-between items-center bg-black/20 rounded-lg p-3 border border-white/10">
                          <span className="text-white font-medium">{recipient.company}</span>
                          <span className="text-teal-400 font-semibold">{recipient.amount.toLocaleString()} 토큰</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* API 호출 기록 상세 */}
              {transactionDetail.type === 'api-recording' && transactionDetail.apiRecording && (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                    <span className="h-4 w-1.5 rounded bg-teal-300"></span>
                    API 호출 기록
                  </h3>
                  
                  {/* 요약 정보 */}
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10 mb-6">
                    <div className="text-white/60 text-sm mb-1">총 기록 수</div>
                    <div className="text-white font-semibold text-lg">{transactionDetail.apiRecording.recordCount}개</div>
                  </div>

                  {/* 호출 기록 상세 */}
                  <div>
                    <h4 className="text-white/80 font-medium mb-4">호출 기록 상세</h4>
                    <div className="space-y-3">
                      {transactionDetail.apiRecording.records.map((record, index) => (
                        <div key={index} className="bg-black/20 rounded-lg p-4 border border-white/10">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/60">기업 ID:</span>
                              <span className="text-white font-medium">{record.companyId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">음원 ID:</span>
                              <span className="text-white font-medium">{record.musicId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">재생 ID:</span>
                              <span className="text-white font-medium">{record.playId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">리워드 코드:</span>
                              <span className="text-teal-400 font-medium">{record.rewardCode}</span>
                            </div>
                            <div className="col-span-2 flex justify-between">
                              <span className="text-white/60">시간:</span>
                              <span className="text-white font-medium">{record.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ))}
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
