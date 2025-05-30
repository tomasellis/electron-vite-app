import { Search, MoreVertical, MessageSquarePlus } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import type { Chat } from '../App.tsx'
import { ReactElement } from 'react'

interface ChatListProps {
  chats: Chat[]
  onChatSelect: (chat: Chat) => void
  selectedChatId?: string
}

export function ChatList({ chats, onChatSelect, selectedChatId }: ChatListProps): ReactElement {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-green-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">WhatsApp</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search or start new chat"
            className="pl-10 bg-white text-gray-900 border-none"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat)}
            className={`
              flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100
              ${selectedChatId === chat.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''}
            `}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.avatar || '/placeholder.svg'} alt={chat.name} />
                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {chat.isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                <span className="text-xs text-gray-500">{chat.timestamp}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs min-w-[20px] h-5 rounded-full">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
