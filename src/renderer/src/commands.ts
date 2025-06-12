import { Chat } from './types'

export interface Command {
    name: string
    description: string
    execute: (args: string[], context: CommandContext) => void
    shortcut: string[]
}

interface CommandContext {
    selectedChat: Chat | null
    filteredChats: Chat[]
    handleChatSelect: (chat: Chat) => void
    setActiveFilter: (filter: string) => void
}

export const COMMANDS: Command[] = [
    {
        name: 'down',
        description: 'Jump N chats down (default: 1)',
        execute: (args, context) => {
            const amount = args[0] ? parseInt(args[0]) : 1
            if (!isNaN(amount)) {
                if (!context.selectedChat) {
                    // If no chat is selected, start from the beginning
                    context.handleChatSelect(context.filteredChats[context.filteredChats.length - 1])
                } else {
                    const currentIndex = context.filteredChats.findIndex((chat) => chat.id === context.selectedChat?.id)
                    const newIndex = Math.min(currentIndex + amount, context.filteredChats.length - 1)
                    context.handleChatSelect(context.filteredChats[newIndex])
                }
            }
        },
        shortcut: ['Ctrl', 'J']
    },
    {
        name: 'up',
        description: 'Jump N chats up (default: 1)',
        execute: (args, context) => {
            const amount = args[0] ? parseInt(args[0]) : 1
            if (!isNaN(amount)) {
                if (!context.selectedChat) {
                    // If no chat is selected, start from the beginning
                    context.handleChatSelect(context.filteredChats[0])
                } else {
                    const currentIndex = context.filteredChats.findIndex((chat) => chat.id === context.selectedChat?.id)
                    const newIndex = Math.max(currentIndex - amount, 0)
                    context.handleChatSelect(context.filteredChats[newIndex])
                }
            }
        },
        shortcut: ['Ctrl', 'K']
    },
    {
        name: 'silence',
        description: 'Toggle silence for the current chat',
        execute: (args, context) => {
            if (context.selectedChat) {
                const chat = context.filteredChats.find(c => c.id === context.selectedChat?.id)
                if (chat) {
                    const currentIndex = context.filteredChats.findIndex(c => c.id === chat.id)
                    const nextChat = context.filteredChats[currentIndex + 1]

                    if (nextChat) {
                        context.handleChatSelect(nextChat)
                    }

                    // Toggle silence status
                    chat.isSilenced = !chat.isSilenced
                }
            }
        },
        shortcut: ['Ctrl', 'R']
    },
    {
        name: 'unread',
        description: 'Mark current chat as unread',
        execute: (args, context) => {
            if (context.selectedChat) {
                const chat = context.filteredChats.find(c => c.id === context.selectedChat?.id)
                if (chat) {
                    chat.isUnread = true
                }
            }
        },
        shortcut: ['Ctrl', 'T']
    }
] 