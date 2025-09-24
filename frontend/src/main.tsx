import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import HomeActivity from './Activities/HomeActivity'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomeActivity />
  </StrictMode>,
)
