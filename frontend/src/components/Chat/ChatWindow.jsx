import MessageList from './MessageList'
import WelcomeScreen from './WelcomeScreen'
import InputBar from './InputBar'
import ChatHistory from './ChatHistory'
import { useApp } from '../../context/AppContext'
import { AlertTriangle, Menu } from 'lucide-react'
import { useState } from 'react'

export default function ChatWindow() {
  const { activeConversation, isLoading, error, setError } = useApp()
  const messages = activeConversation?.messages || []
  const hasMessages = messages.length > 0
  const [showHistory, setShowHistory] = useState(true)

  return (
    <div className="chat-module-container">
      {/* Search Module Internal Sidebar (ChatGPT style) */}
      <ChatHistory collapsed={!showHistory} />

      <div className="chat-main-content">
        {/* Toggle history button (desktop) */}
        <button 
          className="history-toggle-desktop" 
          onClick={() => setShowHistory(!showHistory)}
          style={{ 
            left: showHistory ? '14px' : '14px', 
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
          }}
          title={showHistory ? "Hide history" : "Show history"}
        >
          <Menu size={20} />
        </button>

        <div className="chat-area">
          {/* Error banner */}
          {error && (
            <div
              className="api-alert"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}
              onClick={() => setError(null)}
            >
              <AlertTriangle size={15} />
              {error} — click to dismiss.
            </div>
          )}

          {/* Messages or Welcome */}
          {hasMessages ? (
            <MessageList messages={messages} isLoading={isLoading} />
          ) : (
            <WelcomeScreen />
          )}

          {/* Input */}
          <InputBar />
        </div>
      </div>
    </div>
  )
}
