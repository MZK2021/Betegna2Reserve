import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import { AdBanner } from '../components/AdBanner'
import { useAuth } from '../hooks/useAuth'

interface Conversation {
  id: string
  participantIds: string[]
  roomId?: string
  lastMessageAt?: string
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
}

export function ChatPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const queryClient = useQueryClient()

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get<Conversation[]>('/messages/conversations')
      return res.data
    },
    refetchInterval: 5000
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  const { data: messages } = useQuery({
    queryKey: ['messages', activeConversationId],
    enabled: !!activeConversationId,
    queryFn: async () => {
      const res = await api.get<Message[]>(
        `/messages/conversations/${activeConversationId}/messages`
      )
      return res.data
    },
    refetchInterval: 3000
  })

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!draft.trim() || !activeConversationId || !user) return
      const convo = conversations?.find((c) => c.id === activeConversationId)
      if (!convo) return
      const recipientId = convo.participantIds.find((id) => id !== user.id)
      if (!recipientId) return
      await api.post('/messages', {
        conversationId: convo.id,
        recipientId,
        text: draft.trim()
      })
    },
    onSuccess: () => {
      setDraft('')
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  })

  return (
    <div className="chat-layout">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>💬 {t('chat.title')}</h3>
          <input
            type="text"
            placeholder="🔍 Search conversations..."
            className="chat-search"
          />
        </div>
        <div className="chat-conversations-list">
          {!conversations || conversations.length === 0 ? (
            <div className="chat-empty-state">
              <div className="text-muted">No conversations yet</div>
              <div className="text-xs text-muted mt-2">Start a conversation from a room listing</div>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                className={`chat-conversation-item ${c.id === activeConversationId ? 'active' : ''}`}
                onClick={() => setActiveConversationId(c.id)}
              >
                <div className="chat-avatar">👤</div>
                <div className="chat-conversation-info">
                  <div className="chat-conversation-name">Conversation</div>
                  {c.lastMessageAt && (
                    <div className="chat-conversation-time">
                      {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="chat-pane">
        {!activeConversationId ? (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">💬</div>
            <h3>Welcome to Chat</h3>
            <p className="text-muted">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">👤</div>
                <div>
                  <div className="chat-header-name">Conversation</div>
                  <div className="chat-header-status">Online</div>
                </div>
              </div>
            </div>
            <div className="chat-messages" id="chat-messages" ref={chatMessagesRef}>
              {!messages && (
                <div className="chat-loading">Loading messages...</div>
              )}
              {messages && messages.length === 0 && (
                <div className="chat-empty-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              {messages && messages.map((m) => {
                const isOwn = m.senderId === user?.id
                return (
                  <div
                    key={m.id}
                    className={`chat-message ${isOwn ? 'chat-message-own' : 'chat-message-other'}`}
                  >
                    <div className="chat-message-bubble">
                      <div className="chat-message-text">{m.text}</div>
                      <div className="chat-message-time">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-container">
              <div className="chat-input-actions">
                <button className="chat-input-icon" title="Send photo">📷</button>
                <button className="chat-input-icon" title="Emoji">😊</button>
                <button className="chat-input-icon" title="Attachment">📎</button>
              </div>
              <input
                className="chat-input"
                placeholder={t('chat.typeMessage') ?? 'Type a message...'}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !sendMutation.isPending) {
                    sendMutation.mutate()
                  }
                }}
              />
              <button
                className="chat-send-btn"
                disabled={!draft.trim() || sendMutation.isPending}
                onClick={() => sendMutation.mutate()}
                title="Send"
              >
                ➤
              </button>
            </div>
          </>
        )}
        <div className="chat-ad-container">
          <AdBanner position="CHAT_BOTTOM" />
        </div>
      </div>
    </div>
  )
}
