import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Providers } from "./providers.tsx"

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={routerBase}>
  <Providers>
    <App />
  </Providers>
  </BrowserRouter>
)
