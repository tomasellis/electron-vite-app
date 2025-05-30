import { useState } from 'react'
import { ChatList } from './components/chat-list'
import { ChatInterface } from './components/chat-interface'
import { Button } from './components/ui/button'
import { Menu, MessageCircle } from 'lucide-react'

export interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline: boolean
}

export interface Message {
  id: string
  text: string
  timestamp: string
  isOwn: boolean
  status: 'sent' | 'delivered' | 'read'
}

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Saron Johnson',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'Hey! How are you doing?',
    timestamp: '2:30 PM',
    unreadCount: 2,
    isOnline: true
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'Thanks for the help yesterday!',
    timestamp: '1:45 PM',
    unreadCount: 0,
    isOnline: false
  },
  {
    id: '3',
    name: 'Family Group',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: "Mom: Don't forget dinner tonight",
    timestamp: '12:20 PM',
    unreadCount: 5,
    isOnline: true
  },
  {
    id: '4',
    name: 'Alex Rivera',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'See you at the meeting!',
    timestamp: '11:30 AM',
    unreadCount: 0,
    isOnline: true
  },
  {
    id: '5',
    name: 'Emma Wilson',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'The project looks great 👍',
    timestamp: 'Yesterday',
    unreadCount: 1,
    isOnline: false
  }
]

const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      text: 'Hey! How are you doing?',
      timestamp: '2:25 PM',
      isOwn: false,
      status: 'read'
    },
    {
      id: '2',
      text: "I'm doing great! Just finished a big project at work.",
      timestamp: '2:27 PM',
      isOwn: true,
      status: 'read'
    },
    {
      id: '3',
      text: "That's awesome! What kind of project was it?",
      timestamp: '2:30 PM',
      isOwn: false,
      status: 'delivered'
    }
  ],
  '2': [
    {
      id: '1',
      text: 'Thanks for the help yesterday!',
      timestamp: '1:45 PM',
      isOwn: false,
      status: 'read'
    },
    {
      id: '2',
      text: 'No problem at all! Happy to help.',
      timestamp: '1:47 PM',
      isOwn: true,
      status: 'read'
    }
  ],
  '3': [
    {
      id: '1',
      text: "Don't forget dinner tonight",
      timestamp: '12:20 PM',
      isOwn: false,
      status: 'read'
    },
    {
      id: '2',
      text: 'What time again?',
      timestamp: '12:21 PM',
      isOwn: true,
      status: 'read'
    },
    {
      id: '3',
      text: '7 PM sharp!',
      timestamp: '12:22 PM',
      isOwn: false,
      status: 'delivered'
    }
  ]
}

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleChatSelect = (chat: Chat): void => {
    setSelectedChat(chat)
    setIsSidebarOpen(false)
  }

  return (
    <>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>

      <div className="flex h-screen bg-gray-100">
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 h-full bg-white border-r border-gray-200 z-50 lg:z-0
      `}
        >
          <ChatList
            chats={mockChats}
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChat?.id}
          />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <ChatInterface
              chat={selectedChat}
              messages={mockMessages[selectedChat.id] || []}
              onMenuClick={() => setIsSidebarOpen(true)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden absolute top-4 left-4"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <MessageCircle className="h-24 w-24 text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                Welcome to WhatsApp Clone
              </h2>
              <p className="text-gray-500 text-center max-w-md">
                Select a chat from the sidebar to start messaging. Stay connected with your friends
                and family!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default App
