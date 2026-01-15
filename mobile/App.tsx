import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthProvider, useAuth } from './src/contexts/AuthContext'
import { LoginScreen } from './src/screens/LoginScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { ErrorBoundary } from './src/components/ErrorBoundary'
import { View, Text, StyleSheet, StatusBar as RNStatusBar, ActivityIndicator } from 'react-native'

const Stack = createNativeStackNavigator()

function AppNavigator() {
  const { user, isLoading } = useAuth()

  if (isLoading === true) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  const initialRoute = user ? "Home" : "Login"

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RNStatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
})
