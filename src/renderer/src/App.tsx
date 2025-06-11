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
  const [ready, setReady] = useState(false)
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [activeFilter, setActiveFilter] = useState('inbox')
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 'fake-chat-1',
      name: 'Fake George',
      unreadCount: 1,
      isSilenced: false,
      isUnread: true,
    },
    {
      id: 'fake-chat-2',
      name: 'Person John',
      unreadCount: 1,
      isSilenced: false,
      isUnread: true,
    }
  ])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Record<string, IncomingMessage[]>>({
    'fake-chat-1': [
      {
        key: {
          remoteJid: 'fake-chat-1',
          fromMe: true,
          id: 'msg-1'
        },
        message: {
          conversation: 'Hey George, how are you?'
        },
        messageTimestamp: Math.floor(Date.now() / 1000) - 3600,
        status: 2
      },
      {
        key: {
          remoteJid: 'fake-chat-1',
          fromMe: false,
          id: 'msg-2'
        },
        message: {
          conversation: 'I\'m good! Just working on some new projects.'
        },
        messageTimestamp: Math.floor(Date.now() / 1000) - 3500,
        status: 2
      },
      {
        key: {
          remoteJid: 'fake-chat-1',
          fromMe: true,
          id: 'msg-3'
        },
        message: {
          conversation: 'That sounds interesting! What kind of projects?'
        },
        messageTimestamp: Math.floor(Date.now() / 1000) - 3400,
        status: 2
      }
    ].reverse(),
    'fake-chat-2': [
      {
        key: {
          remoteJid: 'fake-chat-2',
          fromMe: false,
          id: 'msg-4'
        },
        message: {
          conversation: 'Hi there! Do you have time for a quick call?'
        },
        messageTimestamp: Math.floor(Date.now() / 1000) - 1800,
        status: 2
      },
      {
        key: {
          remoteJid: 'fake-chat-2',
          fromMe: true,
          id: 'msg-5'
        },
        message: {
          conversation: 'Sure, I can talk now. What\'s up?'
        },
        messageTimestamp: Math.floor(Date.now() / 1000) - 1700,
        status: 2
      },
      {
        key: {
          remoteJid: 'fake-chat-2',
          fromMe: false,
          id: 'msg-6'
        },
        message: {
          conversation: 'Great! I wanted to discuss the new project timeline.'
        },
        messageTimestamp: Math.floor(Date.now() / 1000) - 1600,
        status: 2
      }
    ].reverse()
  })

  const availableFilters = ['inbox', 'unreads', 'silenced']

  const cycleFilter = (direction: 'next' | 'prev') => {
    const currentIndex = availableFilters.indexOf(activeFilter)
    const nextIndex = direction === 'next'
      ? (currentIndex + 1) % availableFilters.length
      : (currentIndex - 1 + availableFilters.length) % availableFilters.length
    setActiveFilter(availableFilters[nextIndex])
  }

  const filteredChats = chats.filter((chat) => {
    if (activeFilter === 'unreads') return chat.isUnread
    if (activeFilter === 'silenced') return chat.isSilenced
    return true // inbox shows all chats
  }).sort((a, b) => {
    // If both are silenced or both are not silenced, maintain original order
    if (a.isSilenced === b.isSilenced) return 0
    // Put silenced chats at the bottom
    return a.isSilenced ? 1 : -1
  })

  useEffect(() => {
    window.electronAPI.onQR(async (code) => {
      console.log('got qr', { code })
      setQR(code)
      console.log('got dataUrl', { code })
    })
    window.electronAPI.onReady(() => {
      setQR(null)
      setReady(true)
    })
    window.electronAPI.onSyncData((data) => {
      setIsLoading(false)

      setChats(prevChats => {
        const newChats = [...prevChats]
        data.chats.forEach(newChat => {
          const existingIndex = newChats.findIndex(chat => chat.id === newChat.id)
          if (existingIndex === -1) {
            newChats.push(newChat)
          } else {
            newChats[existingIndex] = { ...newChats[existingIndex], ...newChat }
          }
        })
        return newChats
      })

      setContacts(prevContacts => {
        const newContacts = [...prevContacts]
        data.contacts.forEach(newContact => {
          const existingIndex = newContacts.findIndex(contact => contact.id === newContact.id)
          if (existingIndex === -1) {
            newContacts.push(newContact)
          } else {
            newContacts[existingIndex] = { ...newContacts[existingIndex], ...newContact }
          }
        })
        return newContacts
      })

      setMessages(prevMessages => {

        console.log('HISTORY SYNC MESSAGES>>>>>>>>>>')
        console.log('\n\n\n')
        console.log({ prevMessages })
        const updatedMessages = { ...prevMessages }
        Object.entries(data.messages).forEach(([chatId, msgs]) => {
          if (!updatedMessages[chatId]) {
            updatedMessages[chatId] = msgs
          } else {
            const uniqueMessages = [...updatedMessages[chatId]]
            msgs.forEach(newMsg => {
              const existingIndex = uniqueMessages.findIndex(msg => msg.key.id === newMsg.key.id)
              if (existingIndex === -1) {
                uniqueMessages.push(newMsg)
              } else {
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
      console.log('\n\n\n')
      console.log('NEW MESSAGES ARRIVED>>>>>>>>>>>>>')
      console.log({ newMessages })
      setMessages(prevMessages => {
        const updatedMessages = { ...prevMessages }

        console.log('\n\n')
        console.log('onNewMessages', { prevMessages, newMessages })
        Object.entries(newMessages).forEach(([chatId, msgs]) => {
          if (!updatedMessages[chatId]) {
            updatedMessages[chatId] = []
          }
          const uniqueNewMessages = msgs.filter(newMsg =>
            !updatedMessages[chatId].some(existingMsg =>
              existingMsg.key.id === newMsg.key.id
            )
          )
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
        if (filteredChats.length === 0) return

        if (!selectedChat) {
          handleChatSelect(filteredChats[0])
          return
        }

        const currentIndex = filteredChats.findIndex((chat) => chat.id === selectedChat.id)
        if (currentIndex === -1) {
          handleChatSelect(filteredChats[0])
          return
        }

        if (currentIndex === filteredChats.length - 1) {
          handleChatSelect(filteredChats[0])
          return
        }

        handleChatSelect(filteredChats[currentIndex + 1])
      }
    },
    {
      key: 'k',
      ctrl: true,
      meta: false,
      action: () => {
        if (filteredChats.length === 0) return

        if (!selectedChat) {
          handleChatSelect(filteredChats[filteredChats.length - 1])
          return
        }

        const currentIndex = filteredChats.findIndex((chat) => chat.id === selectedChat.id)
        if (currentIndex === -1) {
          handleChatSelect(filteredChats[filteredChats.length - 1])
          return
        }

        if (currentIndex === 0) {
          handleChatSelect(filteredChats[filteredChats.length - 1])
          return
        }

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
            chat.id === selectedChat.id ? { ...chat, isUnread: true } : chat
          )
        )
      }
    },
    {
      key: 'r',
      ctrl: true,
      meta: false,
      action: () => {
        if (!selectedChat) return

        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === selectedChat.id ? { ...chat, isSilenced: !chat.isSilenced } : chat
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
      key: 'm',
      ctrl: true,
      shift: true,
      action: () => {
        setIsCommandBarOpen(prev => !prev)
      }
    },
    {
      key: 'h',
      ctrl: true,
      meta: false,
      action: () => cycleFilter('prev')
    },
    {
      key: 'l',
      ctrl: true,
      meta: false,
      action: () => cycleFilter('next')
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
    console.log("loading", messages)
  }, [messages])

  const borderColor = "rgb(250,250,250,0.1)"
  const listBg = "rgb(22,23,23)"
  const bgColor = "rgb(22,23,23)"

  return (
    <div className="flex h-screen text-white overflow-hidden" style={{
      backgroundColor: bgColor
    }}>
      {!ready && qr ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <h2 className="text-2xl mb-4">Scan QR Code to Login</h2>
          <img src={qr} alt="qr code" width={256} height={256} className="rounded-lg" />
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0f8a6d] mb-4"></div>
          <h2 className="text-2xl">Loading your chats...</h2>
        </div>
      ) : (
        <>
          {/* Left Sidebar */}
          {/* <div className="w-16 bg-[#1a2330] border-r border-gray-800 flex flex-col items-center py-4 space-y-6 flex-shrink-0">
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
          </div> */}

          {/* Chat List - Fixed width */}
          <div className="w-[320px] flex flex-col flex-shrink-0 border-r" style={{
            backgroundColor: listBg,
            borderColor
          }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b my-5" style={{ borderColor: borderColor }}>
              <h1 className="text-xl font-bold">Chats</h1>
              {/* <div className="flex items-center space-x-2">
                <button className="p-1 rounded-md hover:bg-gray-800">
                  <Plus className="h-5 w-5" />
                </button>
                <button className="p-1 rounded-md hover:bg-gray-800">
                  <Search className="h-5 w-5" />
                </button>
                <button className="p-1 rounded-md hover:bg-gray-800">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div> */}
            </div>

            {/* Filters */}
            <div
              className="flex items-center p-2 space-x-1 border-b"
              style={{ borderColor }}
            >
              <div
                className={`px-2 py-1 rounded-full ${activeFilter === 'inbox' ? 'bg-[#0f8a6d] text-white' : 'text-gray-400 hover:bg-gray-800'} cursor-pointer flex items-center space-x-1 flex-shrink-0`}
                onClick={() => setActiveFilter('inbox')}
              >
                <span>Inbox</span>
                <Badge variant="secondary" className={`ml-1 bg-gray-700 text-xs ${chats.length > 0 ? 'text-white' : 'text-gray-500'}`}>
                  {chats.length}
                </Badge>
              </div>

              <div
                className={`px-2 py-1 rounded-full ${activeFilter === 'unreads' ? 'bg-[#0f8a6d] text-white' : 'text-gray-400 hover:bg-gray-800'} cursor-pointer flex items-center space-x-1 flex-shrink-0`}
                onClick={() => setActiveFilter('unreads')}
              >
                <span>Unreads</span>
                <Badge variant="secondary" className={`ml-1 bg-gray-700 text-xs ${chats.filter((chat) => chat.isUnread).length > 0 ? 'text-white' : 'text-gray-500'}`}>
                  {chats.filter((chat) => chat.isUnread).length}
                </Badge>
              </div>

              <div
                className={`px-2 py-1 rounded-full ${activeFilter === 'silenced' ? 'bg-[#0f8a6d] text-white' : 'text-gray-400 hover:bg-gray-800'} cursor-pointer flex items-center space-x-1 flex-shrink-0`}
                onClick={() => setActiveFilter('silenced')}
              >
                <span>Silenced</span>
                <Badge variant="secondary" className={`ml-1 bg-gray-700 text-xs text-gray-500`}>
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
                    selectedBg="bg-[#0f8a6d]"
                    messages={messages[chat.id] || []}
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
                        : 'No chats in inbox'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Chat or Shortcuts */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <ChatView
                chat={selectedChat}
                messages={messages[selectedChat.id] || []}
                onClose={() => setSelectedChat(null)}
                onNewMessage={(message) => {
                  setMessages(prevMessages => {
                    const updatedMessages = { ...prevMessages }
                    if (!updatedMessages[selectedChat.id]) {
                      updatedMessages[selectedChat.id] = []
                    }
                    updatedMessages[selectedChat.id] = [message, ...updatedMessages[selectedChat.id]]
                    return updatedMessages
                  })
                }}
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
