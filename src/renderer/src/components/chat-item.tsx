import { BellOff, User } from 'lucide-react'
import { Badge } from './ui/badge'
import { IncomingMessage } from '../types'
import { ReactElement, useRef, useEffect } from 'react'

interface ChatItemProps {
  chat: any
  contact?: {
    id: string
    name?: string
    notify?: string
    imgUrl?: string | null
  }
  isSelected: boolean
  onSelect: (chat: any) => void
  selectedBg?: string
  messages?: IncomingMessage[]
}

export default function ChatItem({ chat, contact, isSelected, onSelect, selectedBg = 'bg-[rgb(250,250,250,0.1)]', messages = [] }: ChatItemProps): ReactElement {
  const itemRef = useRef<HTMLDivElement>(null)

  // Scroll into view when selected
  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'nearest'
      })
    }
  }, [isSelected])

  const lastMessage = messages[0] // Messages are in reverse order
  const isAudioMessage = lastMessage?.message?.audioMessage
  const lastMessageContent = isAudioMessage
    ? '🎵 Audio'
    : lastMessage?.message?.conversation || ''
  const lastMessageTime = lastMessage?.messageTimestamp
    ? new Date(Number(lastMessage.messageTimestamp) * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : ''

  return (
    <div
      ref={itemRef}
      className={`flex items-center p-4 cursor-pointer border-b border-[rgb(250,250,250,0.1)] 
        ${isSelected ? selectedBg : ''} 
        ${!isSelected ? 'hover:bg-[#0f8a6d33]' : ''} 
        ${chat.isUnread ? 'bg-opacity-50 bg-[rgb(250,250,250,0.1)]' : ''}`}
      onClick={() => onSelect(chat)}
    >
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
        {contact?.imgUrl && contact.imgUrl !== 'changed' ? (
          <img src={contact.imgUrl} alt={contact.name || chat.name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`font-medium truncate ${isSelected ? 'text-white' : chat.isUnread ? 'font-semibold' : ''}`}>
              {chat.name}
            </span>
            {chat.tag && (
              <Badge
                className={`
                text-xs px-2
                ${chat.tag === 'Kungfu' ? 'bg-green-600' : ''}
                ${chat.tag === 'Friends' ? 'bg-green-600' : ''}
                ${chat.tag === 'Office' ? 'bg-blue-600' : ''}
              `}
              >
                {chat.tag}
              </Badge>
            )}
            {chat.isSilenced && <BellOff className="h-3 w-3 text-gray-400" />}
          </div>
          <span className={`text-xs ${isSelected ? 'text-white' : 'text-gray-400'}`}>{lastMessageTime}</span>
        </div>
        <div className="flex items-center">
          <p className={`text-sm truncate ${isSelected ? 'text-white' : chat.isTyping ? 'text-[#0f8a6d]' : 'text-gray-400'}`}>
            {lastMessage?.key?.fromMe ? 'You: ' : ''}{lastMessageContent}
          </p>
        </div>
      </div>
    </div>
  )
}
