import { useState } from 'react'
import { Login } from './components/login/login'
import Preview from './municaodb_interface_preview_corrigido'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />
  return <Preview />
}

export default App
