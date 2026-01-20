import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Import API config first to set axios baseURL before any components load
import './api'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
