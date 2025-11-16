import { useState } from 'react'
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
        <h3 className="mb-2">{t('chat.title')}</h3>
        {!conversations || conversations.length === 0 ? (
          <div className="text-sm text-muted">No conversations yet</div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              className="full-width text-left"
              style={{
                padding: '0.4rem 0.5rem',
                borderRadius: 6,
                border: 'none',
                background: c.id === activeConversationId ? '#e5e7eb' : 'transparent',
                cursor: 'pointer'
              }}
              onClick={() => setActiveConversationId(c.id)}
            >
              <div className="text-sm">Conversation</div>
              {c.lastMessageAt && (
                <div className="text-xs text-muted">
                  {new Date(c.lastMessageAt).toLocaleTimeString()}
                </div>
              )}
            </button>
          ))
        )}
      </div>
      <div className="chat-pane">
        <div className="chat-messages">
          {!activeConversationId && (
            <div className="text-sm text-muted">Select a conversation to start chatting.</div>
          )}
          {activeConversationId && !messages && (
            <div className="text-sm text-muted">Loading messages...</div>
          )}
          {activeConversationId && messages && (
            <>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    marginBottom: '0.4rem',
                    textAlign: m.senderId === user?.id ? 'right' : 'left'
                  }}
                >
                  <span
                    className="text-sm"
                    style={{
                      display: 'inline-block',
                      padding: '0.35rem 0.6rem',
                      borderRadius: 12,
                      background: m.senderId === user?.id ? '#111827' : '#e5e7eb',
                      color: m.senderId === user?.id ? '#f9fafb' : '#111827'
                    }}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="chat-input-row">
          <input
            className="full-width"
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
            className="btn-primary"
            disabled={!activeConversationId || sendMutation.isPending}
            onClick={() => sendMutation.mutate()}
          >
            {t('chat.send')}
          </button>
        </div>
        <div className="mt-4">
          <AdBanner position="CHAT_BOTTOM" />
        </div>
      </div>
    </div>
  )
}
