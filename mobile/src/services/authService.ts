import { api } from '../config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

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

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/api/auth/login', {
      email,
      password,
    })
    
    const { user, token } = response.data.data
    await AsyncStorage.setItem('token', token)
    await AsyncStorage.setItem('user', JSON.stringify(user))
    
    return { user, token }
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['token', 'user'])
  },

  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token')
  },
}
