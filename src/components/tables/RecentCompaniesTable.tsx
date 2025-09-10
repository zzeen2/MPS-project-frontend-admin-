import Card from '@/components/ui/Card'

const MOCK = [
  { name: 'MelOn Entertainment', date: '2025-08-05', tier: 'Business', firstUse: true },
  { name: 'Spotify Korea', date: '2025-08-04', tier: 'Standard', firstUse: false },
  { name: 'Kakao Music', date: '2025-08-03', tier: 'Standard', firstUse: true },
  { name: 'Genie Music', date: '2025-08-02', tier: 'Business', firstUse: false },
]

export default function RecentCompaniesTable() {
  return (
    <Card>
      <div className="mb-3 text-sm font-semibold text-white">최근 가입 기업 (1주)</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-white/60">
            <tr>
              <th className="py-2 pr-4">기업명</th>
              <th className="py-2 pr-4">가입일</th>
              <th className="py-2 pr-4">등급</th>
              <th className="py-2 pr-0 text-right">첫 사용 여부</th>
            </tr>
          </thead>
          <tbody>
            {MOCK.map((c) => (
              <tr key={c.name} className="border-t border-white/5">
                <td className="py-2 pr-4 text-white">{c.name}</td>
                <td className="py-2 pr-4 text-white/80">{c.date}</td>
                <td className="py-2 pr-4 text-white/80">{c.tier}</td>
                <td className="py-2 pr-0 text-right text-white/80">{c.firstUse ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
} 