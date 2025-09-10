type Item = { company: string; calls: number }

const MOCK: Item[] = [
  { company: 'MelOn Entertainment', calls: 3240 },
  { company: 'Spotify Korea', calls: 2891 },
  { company: 'Kakao Music', calls: 2456 },
  { company: 'Genie Music', calls: 1834 },
  { company: 'Bugs Music', calls: 1521 },
]

export default function TopCompaniesApiUsage() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-5">
      <div className="mb-3 text-sm font-semibold text-white">상위 기업별 API 사용량</div>
      <table className="w-full text-sm">
        <tbody>
          {MOCK.map((it) => (
            <tr key={it.company} className="border-t border-white/5 first:border-t-0">
              <td className="py-2 text-white">{it.company}</td>
              <td className="py-2 text-right text-white/80">{it.calls.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 