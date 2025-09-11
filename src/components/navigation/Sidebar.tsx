'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import axios from 'axios'
import { useState } from 'react'

const DASHBOARD = { href: '/admin/dashboard', label: '대시보드' }

const MUSIC_GROUP = {
  label: '음원 관리',
  items: [
    { href: '/admin/musics', label: '음원 목록' }
  ],
}

const REWARD_GROUP = {
  label: '리워드 관리',
  items: [
    { href: '/admin/rewards/companies', label: '기업별 리워드 현황' },
    { href: '/admin/rewards/musics', label: '음원별 리워드 현황' },
  ],
}

const REVENUE_GROUP = {
  label: '매출 관리',
  items: [
    { href: '/admin/revenue', label: '매출 대시보드' },
  ],
}

const SYSTEM_GROUP = {
  label: '시스템 관리',
  items: [
    { href: '/admin/system/api', label: 'API 관리' },
    { href: '/admin/system/tokens', label: '토큰/온체인' },
  ],
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname()
  const [openMusic, setOpenMusic] = useState(true)
  const [openReward, setOpenReward] = useState(true)
  const [openRevenue, setOpenRevenue] = useState(true)
  const [openSystem, setOpenSystem] = useState(true)

  const handleLogout = async() => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      await axios.post('/admin/logout', {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      // 로컬 스토리지 토큰 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('adminId');

      router.push('/admin');
    } catch (error) {
      console.error("로그아웃 실패", error);
      router.push('/admin');
    }
  }

  const isActive = (href: string) => {
    if (href === '/admin/musics') {
      return pathname === '/admin/musics'
    }
    if (href === '/admin/musics/categories') {
      return pathname === '/admin/musics/categories'
    }
    if (href === '/admin/rewards/companies') {
      return pathname === '/admin/rewards/companies'
    }
    if (href === '/admin/rewards/musics') {
      return pathname === '/admin/rewards/musics'
    }
    if (href === '/admin/system/tiers') {
      return pathname === '/admin/system/tiers'
    }
    if (href === '/admin/system/api') {
      return pathname === '/admin/system/api'
    }
    if (href === '/admin/system/tokens') {
      return pathname === '/admin/system/tokens'
    }
    return pathname === href
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-60 border-r border-white/10 bg-neutral-900/80 text-white backdrop-blur-md p-4 flex flex-col">
      <div className="mb-4 px-3 text-sm font-semibold tracking-wide text-white/80">Admin</div>

      <nav className="space-y-2 text-sm">
        <Link
          href={DASHBOARD.href}
          className={`block rounded px-3 py-2 ${isActive(DASHBOARD.href) ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
        >
          {DASHBOARD.label}
        </Link>

        <div>
          <button
            className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-white/70 hover:text-white hover:bg-white/5"
            onClick={() => setOpenMusic((v) => !v)}
            aria-expanded={openMusic}
          >
            <span>{MUSIC_GROUP.label}</span>
            <span className="text-xs">{openMusic ? '▾' : '▸'}</span>
          </button>
          {openMusic && (
            <div className="mt-1 space-y-1 pl-3">
              {MUSIC_GROUP.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded px-3 py-2 ${isActive(item.href) ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-white/70 hover:text-white hover:bg-white/5"
            onClick={() => setOpenReward((v) => !v)}
            aria-expanded={openReward}
          >
            <span>{REWARD_GROUP.label}</span>
            <span className="text-xs">{openReward ? '▾' : '▸'}</span>
          </button>
          {openReward && (
            <div className="mt-1 space-y-1 pl-3">
              {REWARD_GROUP.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded px-3 py-2 ${isActive(item.href) ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>



        <div>
          <button
            className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-white/70 hover:text-white hover:bg-white/5"
            onClick={() => setOpenRevenue((v) => !v)}
            aria-expanded={openRevenue}
          >
            <span>{REVENUE_GROUP.label}</span>
            <span className="text-xs">{openRevenue ? '▾' : '▸'}</span>
          </button>
          {openRevenue && (
            <div className="mt-1 space-y-1 pl-3">
              {REVENUE_GROUP.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded px-3 py-2 ${isActive(item.href) ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-white/70 hover:text-white hover:bg-white/5"
            onClick={() => setOpenSystem((v) => !v)}
            aria-expanded={openSystem}
          >
            <span>{SYSTEM_GROUP.label}</span>
            <span className="text-xs">{openSystem ? '▾' : '▸'}</span>
          </button>
          {openSystem && (
            <div className="mt-1 space-y-1 pl-3">
              {SYSTEM_GROUP.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded px-3 py-2 ${isActive(item.href) ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <button onClick={handleLogout} className="w-full rounded bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"> 로그아웃 </button>
      </div>
    </aside>
  )
} 