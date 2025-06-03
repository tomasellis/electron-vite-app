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
  BellOff,
  RefreshCw
} from 'lucide-react'
import { Badge } from './components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './components/ui/dropdown-menu'
import { useHotkeys } from './hooks/useHotkeys'
import CommandBar from './components/command-bar'
import { Button } from './components/ui/button'

import ChatView from './components/chat-view'
import ShortcutsView from './components/shortcuts-view'
import ChatItem from './components/chat-item'
import { Chat, Contact, IncomingMessage } from './types'
import { COMMANDS } from './commands'

export default function ChatInterface(): ReactElement {
  const [qr, setQR] = useState<string | null>(null)
  const [qrImg, setQrImg] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [number, setNumber] = useState('')
  const [message, setMessage] = useState('')
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false)

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [activeFilter, setActiveFilter] = useState('inbox')
  const [inboxFilter, setInboxFilter] = useState('all')
  const [chats, setChats] = useState<Chat[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Record<string, IncomingMessage[]>>({})

  // Filter chats based on active filter
  const filteredChats = chats.filter((chat) => {
    if (activeFilter === 'unreads') return (chat.unreadCount || 0) > 0
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
    window.electronAPI.onSyncData((data) => {
      // Merge new chats with existing ones
      setChats(prevChats => {
        const newChats = [...prevChats]
        data.chats.forEach(newChat => {
          const existingIndex = newChats.findIndex(chat => chat.id === newChat.id)
          if (existingIndex === -1) {
            // Add new chat if it doesn't exist
            newChats.push(newChat)
          } else {
            // Update existing chat with new data
            newChats[existingIndex] = { ...newChats[existingIndex], ...newChat }
          }
        })
        return newChats
      })

      // Merge new contacts with existing ones
      setContacts(prevContacts => {
        const newContacts = [...prevContacts]
        data.contacts.forEach(newContact => {
          const existingIndex = newContacts.findIndex(contact => contact.id === newContact.id)
          if (existingIndex === -1) {
            // Add new contact if it doesn't exist
            newContacts.push(newContact)
          } else {
            // Update existing contact with new data
            newContacts[existingIndex] = { ...newContacts[existingIndex], ...newContact }
          }
        })
        return newContacts
      })

      // Merge new messages with existing ones
      setMessages(prevMessages => {
        const updatedMessages = { ...prevMessages }
        Object.entries(data.messages).forEach(([chatId, msgs]) => {
          if (!updatedMessages[chatId]) {
            // If chat doesn't exist, add all messages
            updatedMessages[chatId] = msgs
          } else {
            // For existing chat, merge messages and remove duplicates
            const uniqueMessages = [...updatedMessages[chatId]]
            msgs.forEach(newMsg => {
              const existingIndex = uniqueMessages.findIndex(msg => msg.key.id === newMsg.key.id)
              if (existingIndex === -1) {
                // Add new message if it doesn't exist
                uniqueMessages.push(newMsg)
              } else {
                // Update existing message with new data
                uniqueMessages[existingIndex] = { ...uniqueMessages[existingIndex], ...newMsg }
              }
            })
            updatedMessages[chatId] = uniqueMessages
          }
        })
        return updatedMessages
      })
    })

    window.electronAPI.onNewMessages((newMessages) => {
      setMessages(prevMessages => {
        const updatedMessages = { ...prevMessages }

        console.log('\n\n')
        console.log('onNewMessages', { prevMessages, newMessages })
        Object.entries(newMessages).forEach(([chatId, msgs]) => {
          // Ensure we have an array for this chat
          if (!updatedMessages[chatId]) {
            updatedMessages[chatId] = []
          }
          // Filter out messages that already exist in the array
          const uniqueNewMessages = msgs.filter(newMsg =>
            !updatedMessages[chatId].some(existingMsg =>
              existingMsg.key.id === newMsg.key.id
            )
          )
          // Prepend new messages to maintain correct order with flex-col-reverse
          updatedMessages[chatId] = [...uniqueNewMessages, ...updatedMessages[chatId]]
        })
        return updatedMessages
      })

      // Create new chats if they don't exist
      setChats(prevChats => {
        const newChats = [...prevChats]
        Object.keys(newMessages).forEach(chatId => {
          if (!prevChats.some(chat => chat.id === chatId)) {
            newChats.push({
              id: chatId,
              name: chatId.split('@')[0],
              unreadCount: 0,
              isSilenced: false
            })
          }
        })
        return newChats
      })
    })
  }, [])

  function send() {
    if (number && message) {
      window.electronAPI.sendMessage({ number, message })
    }
  }

  const handleReloadSync = () => {
    window.electronAPI.reloadSync()
  }

  // Add this function to handle chat selection
  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
    // Update the chat's read status
    setChats(prevChats =>
      prevChats.map(c =>
        c.id === chat.id ? { ...c, isUnread: false } : c
      )
    )
  }

  useHotkeys([
    {
      key: 'j',
      ctrl: true,
      meta: false,
      action: () => {
        if (!selectedChat) {
          handleChatSelect(filteredChats[0])
          return
        }

        const currentIndex = filteredChats.findIndex((chat) => chat.id === selectedChat.id)

        if (currentIndex === filteredChats.length - 1) return handleChatSelect(filteredChats[0])

        handleChatSelect(filteredChats[currentIndex + 1])
      }
    },
    {
      key: 'k',
      ctrl: true,
      meta: false,
      action: () => {
        if (!selectedChat) {
          handleChatSelect(filteredChats[filteredChats.length - 1])
          return
        }

        const currentIndex = filteredChats.findIndex((chat) => chat.id === selectedChat.id)

        if (currentIndex === 0) return handleChatSelect(filteredChats[filteredChats.length - 1])

        handleChatSelect(filteredChats[currentIndex - 1])
      }
    },
    {
      key: 't',
      ctrl: true,
      meta: false,
      action: () => {
        if (!selectedChat) return

        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === selectedChat.id ? { ...chat, unreadCount: (chat.unreadCount || 0) + 1 } : chat
          )
        )
      }
    },
    {
      key: 'escape',
      ctrl: false,
      meta: false,
      action: () => {
        setSelectedChat(null)
      }
    },
    {
      key: ':',
      ctrl: true,
      shift: true,
      action: () => {
        setIsCommandBarOpen(true)
      }
    }
  ])

  const handleCommand = (command: string) => {
    const [cmd, ...args] = command.split(' ')
    const commandObj = COMMANDS.find(c => c.name.toLowerCase() === cmd.toLowerCase())

    if (commandObj) {
      commandObj.execute(args, {
        selectedChat,
        filteredChats,
        handleChatSelect,
        setActiveFilter
      })
    }
  }

  useEffect(() => {
    console.log("loading", chats, messages, contacts)
  }, [chats, messages, contacts])

  return (
    <div className="flex h-screen bg-[#1a2330] text-white overflow-hidden">
      {!ready && qr ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <h2 className="text-2xl mb-4">Scan QR Code to Login</h2>
          <img src={qr} alt="qr code" width={256} height={256} className="rounded-lg" />
        </div>
      ) : (
        <>
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
                <Button variant="ghost" size="icon" onClick={handleReloadSync}>
                  <RefreshCw className="h-5 w-5" />
                </Button>
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
                  {chats.filter((chat) => (chat.unreadCount || 0) > 0).length}
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
                    onClick={() => handleChatSelect(chat)}
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
              <ChatView
                chat={selectedChat}
                messages={messages[selectedChat.id] || []}
                onClose={() => setSelectedChat(null)}
              />
            ) : (
              <ShortcutsView />
            )}
          </div>

          {/* Command Bar */}
          <CommandBar
            isOpen={isCommandBarOpen}
            onClose={() => setIsCommandBarOpen(false)}
            onExecute={handleCommand}
          />
        </>
      )}
    </div>
  )
}
