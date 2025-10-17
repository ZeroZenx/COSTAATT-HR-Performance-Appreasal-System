import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ChatbotProvider } from './contexts/ChatbotContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChatbotProvider>
      <App />
    </ChatbotProvider>
  </React.StrictMode>,
)