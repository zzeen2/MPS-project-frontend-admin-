type Item = { title: string; meta: string; timeAgo: string }

const MOCK: Item[] = [
  { title: '서버 유지보수 완료', meta: 'API 응답 시간 15% 개선', timeAgo: '2시간 전' },
  { title: '새로운 기업 인증 완료', meta: 'BigHit Music - Business 등급', timeAgo: '4시간 전' },
  { title: '대량 리워드 지급 완료', meta: '₩234K - 45개 기업', timeAgo: '6시간 전' },
  { title: '온체인 동기화 완료', meta: '1,250개 트랜잭션 처리', timeAgo: '8시간 전' },
]

export default function SystemAlerts() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-5">
      <div className="mb-3 text-sm font-semibold text-white">시스템 알림</div>
      <ul className="divide-y divide-white/5 text-sm">
        {MOCK.map((it, idx) => (
          <li key={idx} className="flex items-start justify-between gap-3 py-2.5">
            <div>
              <div className="text-white">{it.title}</div>
              <div className="text-white/60">{it.meta}</div>
            </div>
            <div className="shrink-0 text-white/50">{it.timeAgo}</div>
          </li>
        ))}
      </ul>
    </div>
  )
} 