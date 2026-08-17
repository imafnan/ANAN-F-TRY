export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export type ApiFetchOptions = RequestInit;

export function formatMoney(value?: number | null): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '0';
  }
  return amount.toLocaleString('en-US');
}

export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { headers: customHeaders, body, ...restOptions } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: HeadersInit = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(customHeaders || {}),
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...restOptions,
      body,
      headers,
      credentials: 'include',
    });
  } catch (netErr: any) {
    console.error(`[API Network Error] Request to ${url} failed:`, netErr);
    throw new ApiError(
      0,
      `Backend API unreachable (${url}). Please verify backend server is running.`
    );
  }

  let data: any = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    // Intercept 401 Unauthorized status strictly for internal auth endpoints
    const isAuthEndpoint = cleanEndpoint.startsWith('/admin/auth/') || cleanEndpoint.startsWith('/auth/');
    if (response.status === 401 && isAuthEndpoint && typeof window !== 'undefined') {
      localStorage.removeItem('forrabix_admin_token');
      localStorage.removeItem('forrabix_admin_user');

      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/admin/login')) {
        window.location.href = `/admin/login?next=${encodeURIComponent(currentPath)}`;
      }
    }

    const errorMsg = data?.message || data?.error || `HTTP ${response.status} ${response.statusText}`;
    throw new ApiError(response.status, errorMsg, data);
  }

  return data as T;
}
