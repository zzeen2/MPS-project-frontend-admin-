'use client'
import React, { Suspense } from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from "axios"

function LoginForm() {
    const router = useRouter();
    const sp = useSearchParams();
    const next = sp.get('next') || '/admin/dashboard'

    const [adminId, setAdminId ] = useState('');
    const [adminPw, setAdminPw] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null)

    const onSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErr(null);   
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
            console.log('API_BASE_URL:', API_BASE_URL);
            console.log('Full URL:', `${API_BASE_URL}/admin/login`);
            const res = await axios.post(`${API_BASE_URL}/admin/login`, {adminId, adminPw });

            if(res.status === 200) {
                // 토큰 저장
                const { accessToken, refreshToken, adminId } = res.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('adminId', adminId);
                router.replace(next);
            }else {
                setErr(res.data?.message ?? '로그인 실패')
            }
        } catch (error:any) {
            setErr(error.response?.data?.message ?? '로그인 실패')
        } finally {
            setLoading(false);
        }
    }

    return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-sm">
            <h1 className="mb-8 text-center text-3xl font-bold tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">Admin Login</h1>
            <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-8 md:p-10 shadow-xl shadow-black/40 ring-1 ring-white/5 backdrop-blur-md">
                <form onSubmit={onSubmit} className="space-y-5">
                <label className="block">
                    <span className="text-[11px] tracking-wide text-white/60">아이디</span>
                    <input
                    type="text"
                    name="adminId"
                    placeholder="adminId"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    required
                    className="mt-2 h-10 w-full rounded-md bg-neutral-800/70 px-3 text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-white/40"
                    />
                </label>
                
                <label className="block">
                    <span className="text-[11px] tracking-wide text-white/60">비밀번호</span>
                    <input
                    type="password"
                    name="adminPw"
                    placeholder="비밀번호를 입력하세요"
                    value={adminPw}
                    onChange={(e) => setAdminPw(e.target.value)}
                    required
                    className="mt-2 h-10 w-full rounded-md bg-neutral-800/70 px-3 text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-white/40"
                    />
                </label>

                {err && <p className="text-sm text-red-400">{err}</p>}

                <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-md bg-white text-black font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-60"
                >
                    {loading ? "로그인 중…" : "로그인"}
                </button>
                </form>
            </div >
        </div>
    </main>

    );
};

const LoginPage = () => {
    return (
        <Suspense fallback={<div className="p-6">로딩 중…</div>}>
            <LoginForm />
        </Suspense>
    )
}

export default LoginPage;