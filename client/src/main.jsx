import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Immediate startup cleanup: wipe legacy dummy candidate/demo values
try {
  const legacyName = localStorage.getItem('candidate_name');
  if (legacyName && /^(candidate|ananya|demo|guest|user)$/i.test(legacyName.trim())) {
    localStorage.removeItem('candidate_name');
  }
} catch (e) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
