import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../contexts/AuthContext'

const REMEMBERED_EMAIL_KEY = 'rememberedEmail'
const REMEMBERED_COMPANY_CODE_KEY = 'rememberedCompanyCode'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyCode, setCompanyCode] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  // Load remembered email and company code on mount
  useEffect(() => {
    loadRememberedCredentials()
  }, [])

  const loadRememberedCredentials = async () => {
    try {
      const [savedEmail, savedCompanyCode] = await Promise.all([
        AsyncStorage.getItem(REMEMBERED_EMAIL_KEY),
        AsyncStorage.getItem(REMEMBERED_COMPANY_CODE_KEY),
      ])
      
      if (savedEmail) {
        setEmail(savedEmail)
        setRememberMe(true)
      }
      if (savedCompanyCode) {
        setCompanyCode(savedCompanyCode)
        setRememberMe(true)
      }
    } catch (error) {
      console.error('Failed to load remembered credentials:', error)
    }
  }

  const saveRememberedCredentials = async (email: string, companyCode: string) => {
    try {
      await AsyncStorage.multiSet([
        [REMEMBERED_EMAIL_KEY, email],
        [REMEMBERED_COMPANY_CODE_KEY, companyCode],
      ])
    } catch (error) {
      console.error('Failed to save remembered credentials:', error)
    }
  }

  const clearRememberedCredentials = async () => {
    try {
      await AsyncStorage.multiRemove([REMEMBERED_EMAIL_KEY, REMEMBERED_COMPANY_CODE_KEY])
    } catch (error) {
      console.error('Failed to clear remembered credentials:', error)
    }
  }

  const handleLogin = async () => {
    if (!email || !password || !companyCode) {
      Alert.alert('Error', 'Please enter email, password, and company code')
      return
    }

    if (!/^\d{6}$/.test(companyCode)) {
      Alert.alert('Error', 'Company code must be 6 digits')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password, companyCode)
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        await saveRememberedCredentials(email, companyCode)
      } else {
        await clearRememberedCredentials()
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error?.message || 'Invalid credentials'
      Alert.alert(
        'Login Failed', 
        errorMessage
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Clockly</Text>
        <Text style={styles.subtitle}>Worker Timesheet App</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Company Code (6 digits)"
            placeholderTextColor="#94a3b8"
            value={companyCode}
            onChangeText={setCompanyCode}
            keyboardType="number-pad"
            maxLength={6}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={Boolean(true)}
            autoCapitalize="none"
            autoComplete="password"
          />

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Remember my email and company code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isLoading === true && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={Boolean(isLoading === true)}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#0f172a', // Explicit text color for production builds
    placeholderTextColor: '#94a3b8', // Placeholder text color
  },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
})
