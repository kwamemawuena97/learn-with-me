import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './account.css'
import './learning-path.css'
import './tutor.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
