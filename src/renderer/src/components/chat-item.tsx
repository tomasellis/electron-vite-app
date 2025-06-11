import { BellOff, User } from 'lucide-react'
import { Badge } from './ui/badge'

export default function ChatItem({ chat, isSelected, onClick, selectedBg = 'bg-[rgb(250,250,250,0.1)]' }) {
  return (
    <div
      className={`flex items-center p-4 hover:bg-[rgb(36,38,38)] cursor-pointer border-b border-[rgb(250,250,250,0.1)] ${isSelected ? selectedBg : chat.isUnread ? 'bg-opacity-50 bg-[rgb(250,250,250,0.1)]' : ''
        }`}
      onClick={onClick}
    >
      <div className="relative mr-3">
        <User />
        {/* <img src={chat.avatar} alt={chat.name} width={40} height={40} className="rounded-full" /> */}
        {/* {chat.isActive && ( */}
        {/*   <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#0f8a6d] rounded-full border-2 border-[#1a2330]"></div> */}
        {/* )} */}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`font-medium truncate ${chat.isUnread ? 'font-semibold' : ''}`}>
              {chat.name}
            </span>
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
            {chat.isSilenced && <BellOff className="h-3 w-3 text-gray-400" />}
          </div>
          <span className="text-xs text-gray-400">{chat.time}</span>
        </div>
        <div className="flex items-center">
          {chat.hasVoiceMessage && <span className="text-gray-400 mr-1">✓</span>}
          <p className={`text-sm truncate ${chat.isTyping ? 'text-[#0f8a6d]' : 'text-gray-400'}`}>
            {chat.message}
          </p>
          {chat.isTyping && <div className="ml-1 w-2 h-2 rounded-full bg-[#0f8a6d]"></div>}
        </div>
      </div>
    </div>
  )
}
