'use client'
import { useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

type Props = {
  open: boolean
  onClose: () => void
}

export default function BulkEditModal({ open, onClose }: Props) {
  const [monthlyRewardChange, setMonthlyRewardChange] = useState('')
  const [perCallRewardChange, setPerCallRewardChange] = useState('')
  const [changeType, setChangeType] = useState<'increase' | 'decrease'>('increase')

  if (!open) return null

  const handleSubmit = () => {
    // TODO: Implement bulk edit logic
    console.log('Bulk edit:', { monthlyRewardChange, perCallRewardChange, changeType })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <div className="mb-6">
          <Title>일괄 수정</Title>
          <p className="mt-2 text-sm text-white/60">선택된 음원들의 리워드 설정을 일괄 수정합니다.</p>
        </div>

        <div className="space-y-4">
          {/* 변경 타입 선택 */}
          <div>
            <label className="block text-sm text-white/60 mb-2">변경 타입</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  changeType === 'increase'
                    ? 'bg-teal-600/90 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                onClick={() => setChangeType('increase')}
              >
                증가
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  changeType === 'decrease'
                    ? 'bg-red-600/90 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                onClick={() => setChangeType('decrease')}
              >
                감소
              </button>
            </div>
          </div>

          {/* 월 리워드 변경 */}
          <div>
            <label className="block text-sm text-white/60 mb-2">월 리워드 한도</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={monthlyRewardChange}
                onChange={(e) => setMonthlyRewardChange(e.target.value)}
                placeholder="0"
                className="flex-1 rounded-lg bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-300/60"
              />
              <span className="text-white/60">%</span>
            </div>
          </div>

          {/* 호출당 리워드 변경 */}
          <div>
            <label className="block text-sm text-white/60 mb-2">호출당 리워드</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={perCallRewardChange}
                onChange={(e) => setPerCallRewardChange(e.target.value)}
                placeholder="0"
                className="flex-1 rounded-lg bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-300/60"
              />
              <span className="text-white/60">%</span>
            </div>
          </div>

          {/* 미리보기 */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-white/60 mb-2">미리보기</div>
            <div className="text-sm text-white/80">
              선택된 음원들의 {changeType === 'increase' ? '증가' : '감소'}율:
              <br />
              • 월 리워드: {monthlyRewardChange || '0'}%
              <br />
              • 호출당 리워드: {perCallRewardChange || '0'}%
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-white/15 bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2 px-4 rounded-lg bg-teal-600/90 text-white font-medium hover:bg-teal-500 transition-colors"
          >
            적용
          </button>
        </div>
      </Card>
    </div>
  )
} 