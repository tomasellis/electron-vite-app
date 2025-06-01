import { ReactElement, useEffect, useState } from 'react'
import {
  Search,
  Plus,
  MoreVertical,
  ChevronDown,
  Clock,
  Users,
  MessageSquare,
  Settings,
  Check,
  BellOff
} from 'lucide-react'
import { Badge } from './components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './components/ui/dropdown-menu'
import { useHotkeys } from './hooks/usehotkeys'

import ChatView from './components/chat-view'
import ShortcutsView from './components/shortcuts-view'
import ChatItem from './components/chat-item'

export default function ChatInterface(): ReactElement {
  const [qr, setQR] = useState<string | null>(null)
  const [qrImg, setQrImg] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [number, setNumber] = useState('')
  const [message, setMessage] = useState('')

  const [selectedChat, setSelectedChat] = useState<(typeof chats)[0] | null>(null)
  const [activeFilter, setActiveFilter] = useState('inbox')
  const [inboxFilter, setInboxFilter] = useState('all')
  const [chats, setChats] = useState<any[]>([
    {
      id: 1,
      name: 'Matías Carpintini',
      message: 'typing...',
      time: '17:18',
      avatar: '/placeholder.svg?height=40&width=40',
      isTyping: true,
      isUnread: true,
      isSilenced: true,
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
      isUnread: false,
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
    }
  ])

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

  useEffect(() => {
    window.electronAPI.onQR(async (code) => {
      console.log('got qr', { code })
      setQR(code)
      console.log('got dataUrl', { code })
      setQrImg(code)
    })
    window.electronAPI.onReady(() => {
      setQR(null)
      setReady(true)
    })
  }, [])

  function send() {
    if (number && message) {
      window.electronAPI.sendMessage({ number, message })
    }
  }

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

  // if (!ready && qr) {
  //   console.log('QR>>>>>', qr)
  //   return (
  //     <div style={{ padding: 20 }}>
  //       <h2>scan me :^)</h2>
  //       <img src={qrImg} alt="qr code" width={256} height={256} />
  //     </div>
  //   )
  // }
  //
  // return (
  //   <div style={{ padding: 20 }}>
  //     <h2>yo you re in</h2>
  //     <input
  //       placeholder="number"
  //       value={number}
  //       onChange={(e) => setNumber(e.target.value)}
  //       style={{ marginBottom: 10, display: 'block', width: '100%' }}
  //     />
  //     <textarea
  //       placeholder="message"
  //       value={message}
  //       onChange={(e) => setMessage(e.target.value)}
  //       style={{ marginBottom: 10, display: 'block', width: '100%' }}
  //     />
  //     <button onClick={send}>send it 📨</button>
  //   </div>
  // )

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
            filteredChats.map((chat) => (
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
