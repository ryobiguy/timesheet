import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Get API URL from environment or use default
let API_BASE_URL = 'https://timesheet-6uuv.onrender.com'

try {
  // Try to get from expo-constants if available
  const Constants = require('expo-constants')
  if (Constants?.expoConfig?.extra?.apiUrl) {
    API_BASE_URL = Constants.expoConfig.extra.apiUrl
  } else if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
  }
} catch (e) {
  // Fallback to process.env if expo-constants fails
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
  }
}

// Log API URL in development
if (__DEV__) {
  console.log('API Base URL:', API_BASE_URL)
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const fullUrl = error.config ? `${error.config.baseURL || API_BASE_URL}${error.config.url}` : 'Unknown URL'
    
    if (__DEV__) {
      console.error('API Error:', {
        fullUrl,
        url: error.config?.url,
        baseURL: error.config?.baseURL || API_BASE_URL,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        code: error.code,
        data: error.response?.data,
        stack: error.stack,
      })
    }
    
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      await AsyncStorage.multiRemove(['token', 'user'])
    }
    return Promise.reject(error)
  }
)
