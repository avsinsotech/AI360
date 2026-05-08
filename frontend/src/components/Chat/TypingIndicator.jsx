export default function TypingIndicator() {
  return (
    <div className="message-wrapper assistant">
      <div className="message-avatar assistant">T</div>
      <div className="message-bubble">
        <div className="typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  )
}
