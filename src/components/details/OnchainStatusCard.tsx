export default function OnchainStatusCard() {
  const success = 1245
  const pending = 23
  const fail = 5
  const total = success + pending + fail
  const successRate = Math.round((success / total) * 100)

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-5">
      <div className="mb-3 text-sm font-semibold text-white">온체인 트랜잭션 상태</div>
      <table className="w-full text-sm">
        <tbody>
          <tr className="border-t border-white/5 first:border-t-0">
            <td className="py-2 text-white/70">성공</td>
            <td className="py-2 text-right text-white">{success.toLocaleString()}건</td>
          </tr>
          <tr className="border-t border-white/5">
            <td className="py-2 text-white/70">처리 중</td>
            <td className="py-2 text-right text-white">{pending.toLocaleString()}건</td>
          </tr>
          <tr className="border-t border-white/5">
            <td className="py-2 text-white/70">실패</td>
            <td className="py-2 text-right text-white">{fail.toLocaleString()}건</td>
          </tr>
          <tr className="border-t border-white/5">
            <td className="py-2 text-white/70">성공률</td>
            <td className="py-2 text-right text-white">{successRate}%</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full rounded bg-white/40" style={{ width: `${successRate}%` }} />
      </div>
    </div>
  )
} 