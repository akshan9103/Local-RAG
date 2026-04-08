
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
interface FetchOptions extends Omit<RequestInit, 'body' | 'headers'> {
  data?: any;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Backend base URL

export async function fetchApi(path: string, options: FetchOptions = {}) {
  const fullUrl = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const { data, headers: customHeaders = {}, ...restOptions } = options;

  function getToken() {
  if (typeof window === 'undefined') return '';

  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  return cookieToken || localStorage.getItem('token') || '';
  }

  // Get token from localStorage
  const token = getToken();

  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };

  // Default content type for JSON
  if (!headers['Content-Type'] && data && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...restOptions,
    headers,
    credentials: 'include',
  };

  // Handle request body
  if (data) {
    if (data instanceof FormData) {
      config.body = data;
    } else if (headers['Content-Type'] === 'application/json') {
      config.body = JSON.stringify(data);
    } else if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      config.body =
        typeof data === 'string'
          ? data
          : new URLSearchParams(data).toString();
    } else {
      config.body = data;
    }
  }

  try {
    const response = await fetch(fullUrl, config);

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Unauthorized - Please log in again');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || errorData.detail || 'An error occurred'
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error or server is unreachable');
  }
}

// Helper methods
export const api = {
  get: (url: string, options?: Omit<FetchOptions, 'method'>) =>
    fetchApi(url, { ...options, method: 'GET' }),

  post: (url: string, data?: any, options?: Omit<FetchOptions, 'method'>) =>
    fetchApi(url, { ...options, method: 'POST', data }),

  put: (url: string, data?: any, options?: Omit<FetchOptions, 'method'>) =>
    fetchApi(url, { ...options, method: 'PUT', data }),

  delete: (url: string, options?: Omit<FetchOptions, 'method'>) =>
    fetchApi(url, { ...options, method: 'DELETE' }),

  patch: (url: string, data?: any, options?: Omit<FetchOptions, 'method'>) =>
    fetchApi(url, { ...options, method: 'PATCH', data }),
};