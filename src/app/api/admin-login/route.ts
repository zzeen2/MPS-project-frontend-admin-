import { NextResponse } from 'next/server';
import { sign } from '@/lib/auth';

export async function POST(req: Request) {
    const { adminId, adminPw } = await req.json();

    if (
        adminId !== process.env.ADMIN_ID ||
        adminPw !== process.env.ADMIN_PASSWORD
    ) {
        return NextResponse.json({ message: '아이디와 비밀번호를 확인해주세요.' }, { status: 401 });
    }

    const token = sign(`admin|${Date.now()}`);

    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // 8시간
    });
    return res;
}