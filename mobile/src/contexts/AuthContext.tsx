import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, type User } from '../services/authService'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string, companyCode: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  const loadStoredAuth = async () => {
    try {
      const [storedUser, storedToken] = await Promise.all([
        authService.getStoredUser(),
        authService.getStoredToken(),
      ])
      if (storedUser && storedToken) {
        setUser(storedUser)
        setToken(storedToken)
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string, companyCode: string) => {
    const { user, token } = await authService.login(email, password, companyCode)
    setUser(user)
    setToken(token)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
