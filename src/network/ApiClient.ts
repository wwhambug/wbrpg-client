// REST API 통신 (로그인, 회원가입 등 HTTP 요청)

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  playerId: string
  username: string
}

export interface ApiError {
  message: string
  statusCode: number
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }))
    throw { message: err.message ?? 'Request failed', statusCode: res.status } as ApiError
  }

  return res.json() as Promise<T>
}

export const ApiClient = {
  // 로그인 → JWT 반환
  login(data: LoginRequest): Promise<LoginResponse> {
    return request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 회원가입
  register(data: LoginRequest): Promise<{ message: string }> {
    return request<{ message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
