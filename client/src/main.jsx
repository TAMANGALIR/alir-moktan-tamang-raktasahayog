import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <App />
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
