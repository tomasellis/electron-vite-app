import { Bell, BellOff, MoreVertical, Paperclip, Send, Smile, User } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function ChatView({ chat, onClose }) {
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <User />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold">{chat.name}</h2>
              {chat.tag && (
                <Badge
                  className={`
                  text-xs px-2
                  ${chat.tag === 'Kungfu' ? 'bg-green-600' : ''}
                  ${chat.tag === 'Friends' ? 'bg-green-600' : ''}
                  ${chat.tag === 'Office' ? 'bg-blue-600' : ''}
                  ${chat.tag === 'Personal' ? 'bg-purple-600' : ''}
                `}
                >
                  {chat.tag}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400">Active now</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {chat.isSilenced ? (
            <Button variant="ghost" size="icon">
              <BellOff className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3 max-w-xs">
              <p className="text-sm">Test msg 1</p>
              <span className="text-xs text-gray-400 mt-1 block">2:30 PM</span>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[#0f8a6d] rounded-lg p-3 max-w-xs">
              <p className="text-sm">Test msg 2</p>
              <span className="text-xs text-gray-300 mt-1 block">2:32 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          {/* <Button variant="ghost" size="sm"> */}
          {/*   <Paperclip className="h-4 w-4" /> */}
          {/* </Button> */}
          <Input placeholder="Type a message..." className="flex-1 bg-gray-800 border-gray-700" />
          {/* <Button variant="ghost" size="sm"> */}
          {/*   <Smile className="h-4 w-4" /> */}
          {/* </Button> */}
          <Button size="sm" className="bg-[#0f8a6d] hover:bg-[#0d7a5e]">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
