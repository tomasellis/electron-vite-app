import { ReactElement, useState } from 'react'
import {
  Search,
  Plus,
  MoreVertical,
  ChevronDown,
  Clock,
  Users,
  MessageSquare,
  Settings,
  Send,
  Paperclip,
  Smile,
  Check,
  Bell,
  BellOff
} from 'lucide-react'
import { Badge } from './components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './components/ui/dropdown-menu'
import { useHotkeys } from './hooks/usehotkeys'

export default function ChatInterface(): ReactElement {
  const [selectedChat, setSelectedChat] = useState<(typeof chats)[0] | null>(null)
  const [activeFilter, setActiveFilter] = useState('inbox')
  const [inboxFilter, setInboxFilter] = useState('all')

  const chats = [
    {
      id: 1,
      name: 'Matías Carpintini',
      message: 'typing...',
      time: '17:18',
      avatar: '/placeholder.svg?height=40&width=40',
      isTyping: true,
      isUnread: true,
      isSilenced: false,
      tag: 'Personal'
    },
    {
      id: 2,
      name: 'Entrenamiento Martial Games',
      message: 'Eddie: Por Vicente López está empezando a c...',
      time: '17:08',
      avatar: '/placeholder.svg?height=40&width=40',
      tag: 'Kungfu',
      isActive: true,
      isUnread: true,
      isSilenced: false
    },
    {
      id: 3,
      name: 'Zuck',
      message: '0:09',
      time: '16:35',
      avatar: '/placeholder.svg?height=40&width=40',
      tag: 'Friends',
      hasVoiceMessage: true,
      isRead: true,
      isUnread: false,
      isSilenced: false
    },
    {
      id: 4,
      name: 'Michael Scott',
      message: '1:05',
      time: '16:26',
      avatar: '/placeholder.svg?height=40&width=40',
      tag: 'Friends',
      hasVoiceMessage: true,
      isRead: true,
      isUnread: false,
      isSilenced: false
    },
    {
      id: 5,
      name: 'César López',
      message: 'Reacted 👍 to: "yo esta semana voy a estar c...',
      time: '16:15',
      avatar: '/placeholder.svg?height=40&width=40',
      tag: 'Kungfu',
      isActive: true,
      isUnread: true,
      isSilenced: false
    },
    {
      id: 6,
      name: 'random',
      message: 'Matías: mamita jaja',
      time: '15:41',
      avatar: '/placeholder.svg?height=40&width=40',
      tag: 'Office',
      isUnread: false,
      isSilenced: true
    },
    {
      id: 7,
      name: 'office',
      message: 'Matías reacted 😂 to: mañana Matías Carpintini...',
      time: '15:35',
      avatar: '/placeholder.svg?height=40&width=40',
      tag: 'Office',
      isUnread: false,
      isSilenced: false
    },
    {
      id: 8,
      name: 'Instructores Vicente Lopez',
      message: 'Alina: Listo, le confirme para el 18 de mayo.',
      time: '12:48',
      avatar: '/placeholder.svg?height=40&width=40',
      tag: 'Kungfu',
      isActive: true,
      isUnread: false,
      isSilenced: true
    }
  ]

  // Filter chats based on active filter
  const filteredChats: (typeof chats)[0][] = chats.filter((chat) => {
    if (activeFilter === 'unreads') return chat.isUnread
    if (activeFilter === 'silenced') return chat.isSilenced

    // Inbox filters
    if (activeFilter === 'inbox') {
      if (inboxFilter === 'all') return true
      if (inboxFilter === 'kungfu') return chat.tag === 'Kungfu'
      if (inboxFilter === 'friends') return chat.tag === 'Friends'
      if (inboxFilter === 'office') return chat.tag === 'Office'
      if (inboxFilter === 'personal') return chat.tag === 'Personal'
      return true
    }

    return true
  })

  useHotkeys([
    {
      key: 'j',
      ctrl: true,
      meta: false,
      action: () => {
        if (!selectedChat) {
          setSelectedChat(filteredChats[0])
          return
        }

        const currentIndex = filteredChats.findIndex((chat) => chat.id === selectedChat.id)

        if (currentIndex === filteredChats.length - 1) return setSelectedChat(filteredChats[0])

        setSelectedChat(filteredChats[currentIndex + 1])
      }
    },
    {
      key: 'k',
      ctrl: true,
      meta: false,
      action: () => {
        if (!selectedChat) {
          setSelectedChat(filteredChats[filteredChats.length - 1])
          return
        }

        const currentIndex = filteredChats.findIndex((chat) => chat.id === selectedChat.id)

        if (currentIndex === 0) return setSelectedChat(filteredChats[filteredChats.length - 1])

        setSelectedChat(filteredChats[currentIndex - 1])
      }
    }
  ])

  return (
    <div className="flex h-screen bg-[#1a2330] text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-16 bg-[#1a2330] border-r border-gray-800 flex flex-col items-center py-4 space-y-6 flex-shrink-0">
        <div className="p-2 rounded-md hover:bg-gray-800 cursor-pointer">
          <MessageSquare className="h-6 w-6 text-gray-400" />
        </div>
        <div className="p-2 rounded-md hover:bg-gray-800 cursor-pointer">
          <Users className="h-6 w-6 text-gray-400" />
        </div>
        <div className="p-2 rounded-md hover:bg-gray-800 cursor-pointer">
          <Clock className="h-6 w-6 text-gray-400" />
        </div>
        <div className="p-2 rounded-md hover:bg-gray-800 cursor-pointer">
          <Settings className="h-6 w-6 text-gray-400" />
        </div>
      </div>

      {/* Chat List - 1/3 of screen */}
      <div className="w-1/3 bg-[#1a2330] border-r border-gray-800 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="flex items-center space-x-2">
            <button className="p-1 rounded-md hover:bg-gray-800">
              <Plus className="h-5 w-5" />
            </button>
            <button className="p-1 rounded-md hover:bg-gray-800">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-1 rounded-md hover:bg-gray-800">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center p-2 space-x-2 border-b border-gray-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={`flex items-center space-x-1 ${activeFilter === 'inbox' ? 'bg-[#0f8a6d]' : 'bg-gray-800'} text-white px-3 py-1 rounded-full cursor-pointer`}
              >
                <span>Inbox{inboxFilter !== 'all' ? `: ${inboxFilter}` : ''}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  setActiveFilter('inbox')
                  setInboxFilter('all')
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span>All</span>
                  {inboxFilter === 'all' && <Check className="h-4 w-4 ml-2" />}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  setActiveFilter('inbox')
                  setInboxFilter('kungfu')
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Kungfu</span>
                  {inboxFilter === 'kungfu' && <Check className="h-4 w-4 ml-2" />}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  setActiveFilter('inbox')
                  setInboxFilter('friends')
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Friends</span>
                  {inboxFilter === 'friends' && <Check className="h-4 w-4 ml-2" />}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  setActiveFilter('inbox')
                  setInboxFilter('office')
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Office</span>
                  {inboxFilter === 'office' && <Check className="h-4 w-4 ml-2" />}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  setActiveFilter('inbox')
                  setInboxFilter('personal')
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Personal</span>
                  {inboxFilter === 'personal' && <Check className="h-4 w-4 ml-2" />}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            className={`px-3 py-1 rounded-full ${activeFilter === 'unreads' ? 'bg-[#0f8a6d] text-white' : 'text-gray-400 hover:bg-gray-800'} cursor-pointer flex items-center space-x-1`}
            onClick={() => setActiveFilter('unreads')}
          >
            <span>Unreads</span>
            <Badge variant="secondary" className="ml-1 bg-gray-700 text-xs">
              {chats.filter((chat) => chat.isUnread).length}
            </Badge>
          </div>

          <div
            className={`px-3 py-1 rounded-full ${activeFilter === 'silenced' ? 'bg-[#0f8a6d] text-white' : 'text-gray-400 hover:bg-gray-800'} cursor-pointer flex items-center`}
            onClick={() => setActiveFilter('silenced')}
          >
            <span>Silenced</span>
            <Badge variant="secondary" className="ml-1 bg-gray-700 text-xs">
              {chats.filter((chat) => chat.isSilenced).length}
            </Badge>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat, idx) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChat?.id === chat.id}
                onClick={() => setSelectedChat(chat)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="mb-2">
                {activeFilter === 'unreads' ? (
                  <Check className="h-12 w-12" />
                ) : activeFilter === 'silenced' ? (
                  <BellOff className="h-12 w-12" />
                ) : (
                  <MessageSquare className="h-12 w-12" />
                )}
              </div>
              <p className="text-lg">No {activeFilter} chats</p>
              <p className="text-sm mt-1">
                {activeFilter === 'unreads'
                  ? "You've read all your messages"
                  : activeFilter === 'silenced'
                    ? 'No silenced conversations'
                    : `No chats in ${inboxFilter} category`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div>qr</div>

      {/* Right Panel - Chat or Shortcuts */}
      <div className="flex-1 bg-[#1a2330] flex flex-col">
        {selectedChat ? (
          <ChatView chat={selectedChat} onClose={() => setSelectedChat(null)} />
        ) : (
          <ShortcutsView />
        )}
      </div>
    </div>
  )
}

function ChatItem({ chat, isSelected, onClick }) {
  return (
    <div
      className={`flex items-center p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800 ${
        isSelected ? 'bg-gray-800' : ''
      } ${chat.isUnread ? 'bg-opacity-50 bg-gray-900' : ''}`}
      onClick={onClick}
    >
      <div className="relative mr-3">
        <img
          src={chat.avatar || '/placeholder.svg'}
          alt={chat.name}
          width={40}
          height={40}
          className="rounded-full"
        />
        {chat.isActive && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#0f8a6d] rounded-full border-2 border-[#1a2330]"></div>
        )}
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

function ChatView({ chat, onClose }) {
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <img
            src={chat.avatar || '/placeholder.svg'}
            alt={chat.name}
            width={40}
            height={40}
            className="rounded-full"
          />
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
              <p className="text-sm">Hey! How are you doing?</p>
              <span className="text-xs text-gray-400 mt-1 block">2:30 PM</span>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[#0f8a6d] rounded-lg p-3 max-w-xs">
              <p className="text-sm">I'm doing great! Thanks for asking.</p>
              <span className="text-xs text-gray-300 mt-1 block">2:32 PM</span>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3 max-w-xs">
              <p className="text-sm">That's awesome! Want to catch up later?</p>
              <span className="text-xs text-gray-400 mt-1 block">2:35 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input placeholder="Type a message..." className="flex-1 bg-gray-800 border-gray-700" />
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          <Button size="sm" className="bg-[#0f8a6d] hover:bg-[#0d7a5e]">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function ShortcutsView() {
  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Chat</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Navigation</h3>
            <ShortcutSection>
              <ShortcutItem label="Next Chat" shortcut="↓" />
              <ShortcutItem label="Previous Chat" shortcut="↑" />
              <ShortcutItem label="Open Chat" shortcut="O" />
              <ShortcutItem label="Close Chat" shortcut="Esc" />
              <ShortcutItem label="Find" shortcut="⌘ F" />
              <ShortcutItem label="Search in Chat" shortcut="⌘ K" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Actions</h3>
            <ShortcutSection>
              <ShortcutItem label="Done Chat" shortcut="E" />
              <ShortcutItem label="Send Message & Done Chat" shortcut="⌘ Enter" />
              <ShortcutItem label="Mark as Unread" shortcut="U" />
              <ShortcutItem label="Remind Me" shortcut="R" />
              <ShortcutItem label="Archive Chat" shortcut="A" />
              <ShortcutItem label="Delete Chat" shortcut="⌘ D" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Lists</h3>
            <ShortcutSection>
              <ShortcutItem label="Switch between Inbox" shortcut="Tab" />
              <ShortcutItem label="Move to List" shortcut="⌘ [1-9]" />
              <ShortcutItem label="Go to All" shortcut="⌘ A" />
              <ShortcutItem label="Place Chat in List" shortcut="⌘ P" />
              <ShortcutItem label="Place in Silenced" shortcut="⌘ Shift P" />
              <ShortcutItem label="Create New List" shortcut="⌘ N" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Messaging</h3>
            <ShortcutSection>
              <ShortcutItem label="New Message" shortcut="⌘ M" />
              <ShortcutItem label="Reply" shortcut="⌘ R" />
              <ShortcutItem label="Forward" shortcut="⌘ Shift F" />
              <ShortcutItem label="Add Emoji" shortcut="⌘ E" />
              <ShortcutItem label="Attach File" shortcut="⌘ Shift A" />
              <ShortcutItem label="Voice Message" shortcut="⌘ Shift V" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">View</h3>
            <ShortcutSection>
              <ShortcutItem label="Toggle Sidebar" shortcut="⌘ \\" />
              <ShortcutItem label="Zoom In" shortcut="⌘ +" />
              <ShortcutItem label="Zoom Out" shortcut="⌘ -" />
              <ShortcutItem label="Reset Zoom" shortcut="⌘ 0" />
              <ShortcutItem label="Full Screen" shortcut="⌘ Ctrl F" />
              <ShortcutItem label="Dark Mode" shortcut="⌘ Shift D" />
            </ShortcutSection>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Send Later</h3>
            <ShortcutSection>
              <ShortcutItem label="Schedule Message" shortcut="⌘ Shift S" />
              <ShortcutItem label="Send in 1 Hour" shortcut="⌘ 1" />
              <ShortcutItem label="Send Tomorrow" shortcut="⌘ T" />
              <ShortcutItem label="Send Next Week" shortcut="⌘ W" />
              <ShortcutItem label="Custom Schedule" shortcut="⌘ Shift C" />
              <ShortcutItem label="View Scheduled" shortcut="⌘ Shift V" />
            </ShortcutSection>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShortcutSection({ children }): ReactElement {
  return <div className="space-y-3">{children}</div>
}

function ShortcutItem({ label, shortcut }): ReactElement {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-300">{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <kbd className="px-3 py-1 bg-gray-700 rounded text-xs font-mono border border-gray-600">
              {shortcut}
            </kbd>
          </TooltipTrigger>
          <TooltipContent>
            <p>Keyboard shortcut</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
