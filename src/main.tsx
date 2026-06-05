import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import BalisticaDB from './municaodb_interface_preview_corrigido'
import { Login } from './components/login/login'
import './index.css'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />
  }

  return <BalisticaDB onLogout={() => setLoggedIn(false)} />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
