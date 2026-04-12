const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const DEV_TOKEN = 'dev-token';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  headers['Authorization'] = `Bearer ${token ?? DEV_TOKEN}`;

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...fetchOptions,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token ?? DEV_TOKEN}` },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}
