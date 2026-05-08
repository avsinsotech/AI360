import { useApp } from '../../context/AppContext'
import logo from '../../assets/logo.png'
import { PenTool, Lightbulb, Code, MessageSquare } from 'lucide-react'

const SUGGESTIONS = [
  { icon: <PenTool size={18} />, color: '#f59e0b', title: 'Write a story', desc: 'Create a short creative story', prompt: 'Write a short creative story about a time traveler who visits ancient Egypt.' },
  { icon: <Lightbulb size={18} />, color: '#eab308', title: 'Explain a concept', desc: 'Break down complex ideas', prompt: 'Explain quantum computing in simple terms with an analogy.' },
  { icon: <Code size={18} />, color: '#3b82f6', title: 'Write Python code', desc: 'Get coding help fast', prompt: 'Write a Python function to implement a binary search algorithm with comments.' },
  { icon: <MessageSquare size={18} />, color: '#8b5cf6', title: 'Draft an email', desc: 'Professional writing assist', prompt: 'Draft a professional email to request a one-week project deadline extension.' },
]

export default function WelcomeScreen() {
  const { sendMessage } = useApp()

  return (
    <div className="welcome-screen">
      <div className="welcome-logo">
        <img 
          src="/logo.png" 
          alt="AVS Logo" 
          className="welcome-logo-img" 
          width="240" 
          height="80" 
          fetchPriority="high"
        />
      </div>
      
      <h1 className="welcome-title">How can I help you?</h1>
      <p className="welcome-subtitle">
        Ask me anything — I can write, code, explain, brainstorm, and more.
      </p>

      <div className="suggestions-grid">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            className="suggestion-card"
            onClick={() => sendMessage(s.prompt)}
          >
            <div className="suggestion-header">
              <span className="suggestion-icon-wrap" style={{ color: s.color }}>{s.icon}</span>
              <span className="suggestion-title">{s.title}</span>
            </div>
            <span className="suggestion-desc">{s.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
