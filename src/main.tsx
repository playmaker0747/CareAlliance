import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

import { LocationProvider } from './context/LocationContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocationProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LocationProvider>
  </React.StrictMode>,
)
