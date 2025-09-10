import Card from '@/components/ui/Card'

const MOCK = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  title: `Track Title ${i + 1}`,
  artist: `Artist ${i + 1}`,
  plays: 500 + i * 230, // deterministic mock to avoid hydration mismatch
}))

export default function TopTracksTable() {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-white">인기 음원 TOP 10</div>
        <div className="space-x-1 text-xs text-white/70">
          <button className="rounded border border-white/10 px-2 py-1 hover:bg-white/10">오늘</button>
          <button className="rounded border border-white/10 px-2 py-1 hover:bg-white/10">이번 주</button>
          <button className="rounded border border-white/10 px-2 py-1 hover:bg-white/10">이번 달</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-white/60">
            <tr>
              <th className="py-2 pr-4">순위</th>
              <th className="py-2 pr-4">음원명</th>
              <th className="py-2 pr-4">아티스트</th>
              <th className="py-2 pr-0 text-right">재생 횟수</th>
            </tr>
          </thead>
          <tbody>
            {MOCK.map((t) => (
              <tr key={t.rank} className="cursor-pointer border-t border-white/5 hover:bg-white/5" onClick={() => alert(`상세 통계 모달: ${t.title}`)}>
                <td className="py-2 pr-4 text-white/80">{t.rank}</td>
                <td className="py-2 pr-4 text-white">{t.title}</td>
                <td className="py-2 pr-4 text-white/80">{t.artist}</td>
                <td className="py-2 pr-0 text-right text-white">{t.plays.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
} 