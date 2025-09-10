import crypto from 'crypto'
const secret = process.env.SESSION_SECRET!;

export const sign = (payload : string) => {
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return `${payload}.${sig}`;
}

export const verifyToken = (token: string): { ok: boolean; payload: string | null } => {
    if (!token) return { ok: false, payload: null };
    const i = token.lastIndexOf('.');
    if (i < 0) return { ok: false, payload: null };
    const payload = token.slice(0, i);
    const sig = token.slice(i + 1);
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    try {
        const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
        return { ok, payload: ok ? payload : null };
    } catch {
        return { ok: false, payload: null };
    }
}