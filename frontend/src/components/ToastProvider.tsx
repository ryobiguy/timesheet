import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#e2e8f0',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#34d399',
            secondary: '#1e293b',
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171',
            secondary: '#1e293b',
          },
        },
      }}
    />
  )
}
