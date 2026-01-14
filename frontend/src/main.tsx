import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { AuthProvider } from './contexts/AuthContext'
import { queryClient } from './lib/queryClient'
import { ToastProvider } from './components/ToastProvider'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ToastProvider />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
