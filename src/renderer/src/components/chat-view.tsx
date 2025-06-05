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

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">


        {messages.map((message) => (
          <MessageBubble
            key={`${message.key.id}-${message.key.remoteJid}`}
            message={message}
            isOwn={message.key.fromMe ?? false}
          />
        ))}

      </div>
      {/* Test audio player */}
      <div className="flex flex-col items-center mb-4 space-y-2">
        <audio
          controls
          className="w-[200px]"
          src="app://audio/test.wav"
        >
          Your browser does not support the audio element.
        </audio>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            try {
              const result = await window.electronAPI.transcribeAudio('app://test1.wav')
              console.log('Transcription:', result)
              // Display the transcription text
              alert(result || 'No transcription available')
            } catch (error) {
              console.error('Error transcribing audio:', error)
              alert('Error transcribing audio. Check console for details.')
            }
          }}
          className="text-xs"
        >
          <Mic className="h-3 w-3 mr-1" />
          Transcribe Test Audio
        </Button>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          {/* <Button variant="ghost" size="sm"> */}
          {/*   <Paperclip className="h-4 w-4" /> */}
          {/* </Button> */}
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border-gray-700"
          />
          {/* <Button variant="ghost" size="sm"> */}
          {/*   <Smile className="h-4 w-4" /> */}
          {/* </Button> */}
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="bg-[#0f8a6d] hover:bg-[#0d7a5e]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
