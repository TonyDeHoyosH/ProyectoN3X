import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css' // Basic styles (assuming it will be created if used)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
