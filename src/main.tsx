import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

document.documentElement.classList.add('pts-app')
try {
  if (window.Telegram?.WebApp) {
    document.documentElement.classList.add('tg-mini-app')
  }
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
