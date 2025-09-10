type Item = { endpoint: string; method?: string; lastUsed?: string }

const MOCK: Item[] = [
  { endpoint: '/v1/companies/{id}/logo', method: 'GET', lastUsed: '—' },
  { endpoint: '/v1/musics/{id}/delete', method: 'DELETE', lastUsed: '—' },
  { endpoint: '/v1/rewards/export', method: 'POST', lastUsed: '—' },
  { endpoint: '/v1/whitelist/import', method: 'POST', lastUsed: '—' },
]

export default function UnusedApiTable() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-6">
      <div className="mb-4 text-sm font-semibold text-white">미사용 API 목록 (Top)</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-white/60">
            <tr>
              <th className="py-2 pr-4">Method</th>
              <th className="py-2 pr-4">Endpoint</th>
              <th className="py-2 pr-4 text-right">Last Used</th>
            </tr>
          </thead>
          <tbody>
            {MOCK.map((it) => (
              <tr key={it.endpoint} className="border-t border-white/5">
                <td className="py-2 pr-4 text-white/80">{it.method ?? 'GET'}</td>
                <td className="py-2 pr-4 text-white">{it.endpoint}</td>
                <td className="py-2 pr-0 text-right text-white/60">{it.lastUsed ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 