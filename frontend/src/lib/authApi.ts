const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'SUPERVISOR' | 'WORKER'
  orgId: string
  org?: {
    id: string
    name: string
  }
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginInput {
  email: string
  password: string
  companyCode?: string
}

export interface RegisterInput {
  email: string
  name: string
  password: string
  companyCode: string
  role?: 'ADMIN' | 'SUPERVISOR' | 'WORKER'
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = localStorage.getItem('token')
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export const authApi = {
  login: async (data: LoginInput): Promise<{ data: AuthResponse }> => {
    return fetchApi<{ data: AuthResponse }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  register: async (data: RegisterInput): Promise<{ data: AuthResponse }> => {
    return fetchApi<{ data: AuthResponse }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
