import { useState, useRef, useCallback, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { Send, Sparkles, ChevronDown } from 'lucide-react'

const GROQ_MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
]

export default function InputBar() {
  const { sendMessage, isLoading, settings, updateSettings } = useApp()
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  const models = GROQ_MODELS

  const autoResize = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [])

  useEffect(() => {
    autoResize()
  }, [text, autoResize])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    sendMessage(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, isLoading, sendMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleModelChange = (e) => {
    updateSettings({ model: e.target.value })
  }

  return (
    <div className="input-bar-container">
      <div className="input-bar">
        <div className="input-bar-top">
          <textarea
            ref={textareaRef}
            className="input-textarea"
            placeholder={isLoading ? 'Thinking...' : 'Message AVS Saarthi AI...'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            autoFocus
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!text.trim() || isLoading}
            title="Send message"
          >
            {isLoading ? (
              <div className="spinner" style={{ width: 14, height: 14 }} />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>

        <div className="input-bar-bottom">
          <div className="model-selector" title="Select AI model">
            <Sparkles size={11} />
            <select value={settings.model} onChange={handleModelChange} disabled={isLoading}>
              {models.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <span className="input-hint">Enter to send · Shift+Enter for newline</span>
        </div>
      </div>
      <p className="footer-disclaimer">
        TushGPT can make mistakes. Verify important information.
      </p>
    </div>
  )
}
