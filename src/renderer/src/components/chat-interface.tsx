import { ReactElement, useState } from 'react'
import { Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send, Menu } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { MessageBubble } from './ui/message-bubble'

type Chat = any
type Message = any

type ChatInterfaceProps = {
  chat: Chat
  messages: Message[]
  onMenuClick: () => void
}

export function ChatInterface({ chat, messages, onMenuClick }: ChatInterfaceProps): ReactElement {
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = (): void => {
    if (newMessage.trim()) {
      // In a real app, you'd send this to your backend
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center p-4 bg-green-600 text-white border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2 text-white hover:bg-green-700"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chat.avatar || '/placeholder.svg'} alt={chat.name} />
            <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {chat.isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="ml-3 flex-1">
          <h2 className="font-semibold">{chat.name}</h2>
          <p className="text-sm text-green-100">
            {chat.isOnline ? 'Online' : 'Last seen recently'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Message input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <Smile className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyUp={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12"
            />
            {newMessage.trim() ? (
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
