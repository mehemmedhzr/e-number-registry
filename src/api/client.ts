import axios, { type AxiosError, type AxiosInstance } from 'axios'

export const TOKEN_KEY = 'e_number_auth_token'
export const ROLE_KEY = 'e_number_auth_role'
const LEGACY_TOKEN_KEY = 'icta_sanctum_token'

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
}

/** Origin for file downloads — strips /api from the API base URL */
export function getAppBaseUrl(): string {
  const u = getApiBaseUrl()
  return u.replace(/\/api\/?$/, '') || u
}

function migrateLegacyToken() {
  const cur = localStorage.getItem(TOKEN_KEY)
  const old = localStorage.getItem(LEGACY_TOKEN_KEY)
  if (!cur && old) {
    localStorage.setItem(TOKEN_KEY, old)
  }
}

export function getToken(): string {
  migrateLegacyToken()
  return localStorage.getItem(TOKEN_KEY)?.trim() || ''
}

export function getStoredRole(): string {
  return localStorage.getItem(ROLE_KEY)?.trim() || ''
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

export function saveAuth(token: string, role: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, role)
}

export function parseLoginResponse(data: Record<string, unknown>, fallbackRole: string): { token: string; role: string } {
  const payload = data.payload && typeof data.payload === 'object'
    ? (data.payload as Record<string, unknown>)
    : {}

  const token =
    typeof payload.authToken === 'string'
      ? payload.authToken
      : typeof data.authToken === 'string'
        ? data.authToken
        : ''

  const role =
    typeof payload.role === 'string'
      ? payload.role
      : typeof data.role === 'string'
        ? data.role
        : fallbackRole

  if (!token) throw new Error('Cavabda autentifikasiya tokeni yoxdur')

  return { token, role }
}

export function buildFileUrl(path: string | null): string | null {
  if (!path || typeof path !== 'string') return null
  const base = getAppBaseUrl().replace(/\/$/, '')
  return `${base}/${path.replace(/^\//, '')}`
}

const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export function formatApiError(err: unknown): string {
  if (!err || typeof err !== 'object') return String(err)
  const axiosErr = err as AxiosError<{ error?: string; message?: string; errors?: Record<string, string[]> }>
  const res = axiosErr.response
  if (!res) return (err as Error).message || 'Şəbəkə xətası'
  const data = res.data
  if (data?.error && typeof data.error === 'string') return data.error
  if (data?.message && typeof data.message === 'string') return data.message
  if (data?.errors && typeof data.errors === 'object') {
    const parts: string[] = []
    for (const [key, messages] of Object.entries(data.errors)) {
      const arr = Array.isArray(messages) ? messages : [messages]
      parts.push(`${key}: ${arr.join(', ')}`)
    }
    return parts.join('\n')
  }
  return `Sorğu uğursuz oldu (${res.status})`
}

export { apiClient }
