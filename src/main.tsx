import React from 'react'
import ReactDOM from 'react-dom/client'
import BalisticaDB from './municaodb_interface_preview_corrigido'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BalisticaDB onLogout={() => {}} />
  </React.StrictMode>,
)
