export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('accessToken');
  } catch {
    return null;
  }
}

export function authHeaders(headers?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  const merged: Record<string, string> = {};
  if (headers) {
    const h = new Headers(headers as any);
    h.forEach((v, k) => (merged[k] = v));
  }
  if (token) merged['Authorization'] = `Bearer ${token}`;
  return merged;
}

export async function apiFetch(input: string, init?: RequestInit & { timeoutMs?: number }) {
  const controller = new AbortController();
  const timeoutMs = init?.timeoutMs ?? 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const res = await fetch(input, {
    ...init,
    headers: authHeaders(init?.headers),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  return res;
}


