import crypto from 'crypto'

// Server-side functions
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

// Client-side functions
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  return !!(accessToken && refreshToken);
}

export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // 쿠키도 삭제
  const isSecure = process.env.NODE_ENV === 'production';
  document.cookie = `accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${isSecure ? 'secure; ' : ''}samesite=lax`;
  document.cookie = `refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${isSecure ? 'secure; ' : ''}samesite=lax`;
}

export const refreshAccessToken = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await fetch('/api/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      
      // 쿠키에도 저장
      const isSecure = process.env.NODE_ENV === 'production';
      document.cookie = `accessToken=${data.accessToken}; path=/; ${isSecure ? 'secure; ' : ''}samesite=lax`;
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
        document.cookie = `refreshToken=${data.refreshToken}; path=/; ${isSecure ? 'secure; ' : ''}samesite=lax`;
      }
      
      return true;
    } else {
      clearAuth();
      return false;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearAuth();
    return false;
  }
}

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const accessToken = localStorage.getItem('accessToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newAccessToken = localStorage.getItem('accessToken');
      response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    }
  }

  return response;
}