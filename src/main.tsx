import { createRoot } from 'react-dom/client'
import App from './App'
import { GameProvider } from './state/store'
import './index.css'

// Sin StrictMode a propósito: el reducer usa Math.random y el doble
// render de desarrollo duplicaría las tiradas.
createRoot(document.getElementById('root')!).render(
  <GameProvider>
    <App />
  </GameProvider>,
)
