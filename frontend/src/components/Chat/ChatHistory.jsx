import { useApp } from '../../context/AppContext'
import { groupConversations } from '../../utils/chatUtils'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from '../../utils/dateUtils'

export default function ChatHistory({ collapsed }) {
  const { conversations, activeId, setActiveId, createConversation, deleteConversation } = useApp()
  const grouped = groupConversations(conversations)

  const handleNewChat = () => {
    createConversation()
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (window.confirm('Delete this conversation?')) {
      deleteConversation(id)
    }
  }

  return (
    <div className={`chat-history-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="new-chat-btn-history" onClick={handleNewChat}>
        <Plus size={18} />
        New Chat
      </button>

      <div className="history-list-container">
        {Object.entries(grouped).map(([groupName, groupConvs]) => (
          <div key={groupName} className="history-group">
            <h3 className="history-group-title">{groupName}</h3>
            <div className="history-items">
              {groupConvs.map(conv => (
                <div 
                  key={conv.id} 
                  className={`history-item ${activeId === conv.id ? 'active' : ''}`}
                  onClick={() => setActiveId(conv.id)}
                >
                  <MessageSquare size={16} className="history-item-icon" />
                  <div className="history-item-content">
                    <span className="history-item-title">{conv.title}</span>
                    <span className="history-item-date">{formatDistanceToNow(conv.updatedAt)}</span>
                  </div>
                  <button 
                    className="history-item-delete" 
                    onClick={(e) => handleDelete(e, conv.id)}
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {conversations.length === 0 && (
          <div className="history-empty">
            No recent chats
          </div>
        )}
      </div>
    </div>
  )
}
