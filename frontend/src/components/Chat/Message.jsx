import { useState, lazy, Suspense } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check } from 'lucide-react'
import { formatTime } from '../../utils/dateUtils'

// Lazy load the heavy syntax highlighter component
const CodeBlock = lazy(() => import('./CodeBlock'))

const MarkdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    if (!inline && match) {
      return (
        <Suspense fallback={<pre className="code-block-skeleton"><code>{children}</code></pre>}>
          <CodeBlock language={match[1]}>{children}</CodeBlock>
        </Suspense>
      )
    }
    return <code className={className} {...props}>{children}</code>
  },
}

export default function Message({ message }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="message-avatar assistant">T</div>
      )}

      <div className="message-bubble">
        <div className="message-content">
          {isUser ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        <div className="message-actions">
          <button className="message-action-btn" onClick={handleCopy} title="Copy">
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {message.timestamp && (
            <span className="message-timestamp">{formatTime(message.timestamp)}</span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="message-avatar user">
          You
        </div>
      )}
    </div>
  )
}
