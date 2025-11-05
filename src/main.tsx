import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/print.css'
import App from './App.tsx'
import AdminApp from './AdminApp.tsx'
import { setupAxiosInterceptors } from './configs/AxiosInterceptor'

// Setup axios interceptors trước khi render
setupAxiosInterceptors()

const root = createRoot(document.getElementById('root')!)

// Xác định xem có phải admin app hay không
const isAdminPath = window.location.pathname.startsWith('/admin')

root.render(
  <StrictMode>
    {isAdminPath ? <AdminApp /> : <App />}
  </StrictMode>,
)
