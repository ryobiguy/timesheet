import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyCode, setCompanyCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

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
            value={companyCode}
            onChangeText={setCompanyCode}
            keyboardType="number-pad"
            maxLength={6}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={Boolean(true)}
            autoCapitalize="none"
            autoComplete="password"
          />

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
})
