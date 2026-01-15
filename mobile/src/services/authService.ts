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
    try {
      const response = await api.post<{ data: AuthResponse }>('/api/auth/login', {
        email,
        password,
      })
      
      const { user, token } = response.data?.data || response.data
      if (!user || !token) {
        throw new Error('Invalid response from server')
      }
      
      await AsyncStorage.setItem('token', token)
      await AsyncStorage.setItem('user', JSON.stringify(user))
      
      return { user, token }
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Provide better error messages
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.')
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password')
      } else if (error.response?.status) {
        throw new Error(error.response?.data?.message || `Server error: ${error.response.status}`)
      } else {
        throw new Error(error.message || 'Login failed. Please try again.')
      }
    }
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
