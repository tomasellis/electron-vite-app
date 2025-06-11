import { ReactElement, useState } from 'react'
import { Bell, BellOff, MoreVertical, Paperclip, Send, Smile, User, X, Mic } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Chat, IncomingMessage } from '../types'
import { MessageBubble } from './ui/message-bubble'

interface ChatViewProps {
  chat: Chat
  messages: IncomingMessage[]
  onClose: () => void
  onNewMessage: (message: IncomingMessage) => void
}

export default function ChatView({ chat, messages, onClose, onNewMessage }: ChatViewProps): ReactElement {
  const [message, setMessage] = useState('')

  const handleSendMessage = () => {
    if (message.trim()) {
      // Create a temporary message with pending status
      const tempMessage: IncomingMessage = {
        key: {
          remoteJid: chat.id,
          fromMe: true,
          id: `temp-${Date.now()}`
        },
        message: {
          conversation: message.trim()
        },
        messageTimestamp: Math.floor(Date.now() / 1000),
        status: 0 // PENDING
      }

      // Add to local state immediately
      onNewMessage(tempMessage)

      console.log('Sending message:', {
        to: chat.id,
        message: message.trim(),
        chatName: chat.name,
        chatDetails: chat
      })
      window.electronAPI.sendMessage({ jid: chat.id, message: message.trim() })
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const borderColor = "rgb(250,250,250,0.1)"
  const headerBg = "rgb(22,23,23)"
  const inputBg = "rgb(36,38,38)"

  return (
    <div className="flex flex-col h-full relative" style={{ borderColor }}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b crelative z-10" style={{ backgroundColor: headerBg, borderColor }}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            {chat.name?.[0]?.toUpperCase() || chat.id[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{chat.name || chat.id}</h2>
            <p className="text-sm text-gray-400">Online</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-repeat"
          style={{
            backgroundImage: `url("/background2.png")`,
            backgroundSize: "200px",
            backgroundRepeat: "repeat",
            opacity: 0.85,
          }}
        />
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse relative z-10"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.1) rgba(22, 23, 23, 1)',
          }}
        >
          <style>
            {`
              .flex-1::-webkit-scrollbar {
                width: 6px;
              }
              .flex-1::-webkit-scrollbar-track {
                background: rgb(22, 23, 23);
              }
              .flex-1::-webkit-scrollbar-thumb {
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
              }
              .flex-1::-webkit-scrollbar-thumb:hover {
                background-color: rgba(255, 255, 255, 0.2);
              }
            `}
          </style>
          {messages.map((message) => (
            <MessageBubble
              key={`${message.key.id}-${message.key.remoteJid}`}
              message={message}
              isOwn={message.key.fromMe ?? false}
            />
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 relative z-10">
        <div className="flex items-center space-x-2 pr-2 pl-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-3xl py-5 pl-5 border-none"
            style={{ backgroundColor: inputBg }}
          />
        </div>
      </div>
    </div>
  )
}
