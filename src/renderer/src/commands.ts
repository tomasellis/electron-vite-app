import { Chat } from './types'

export interface Command {
    name: string
    description: string
    execute: (args: string[], context: CommandContext) => void
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
            if (!isNaN(amount) && context.selectedChat) {
                const currentIndex = context.filteredChats.findIndex((chat) => chat.id === context.selectedChat?.id)
                const newIndex = Math.min(currentIndex + amount, context.filteredChats.length - 1)
                context.handleChatSelect(context.filteredChats[newIndex])
            }
        }
    },
    {
        name: 'up',
        description: 'Jump N chats up (default: 1)',
        execute: (args, context) => {
            const amount = args[0] ? parseInt(args[0]) : 1
            if (!isNaN(amount) && context.selectedChat) {
                const currentIndex = context.filteredChats.findIndex((chat) => chat.id === context.selectedChat?.id)
                const newIndex = Math.max(currentIndex - amount, 0)
                context.handleChatSelect(context.filteredChats[newIndex])
            }
        }
    },
    {
        name: 'search',
        description: 'Search for a chat by name',
        execute: (args, context) => {
            const searchQuery = args.join(' ').toLowerCase()
            const foundChat = context.filteredChats.find(chat =>
                chat.name.toLowerCase().includes(searchQuery)
            )
            if (foundChat) {
                context.handleChatSelect(foundChat)
            }
        }
    },
    {
        name: 'filter',
        description: 'Switch between filters (unreads/silenced/inbox)',
        execute: (args, context) => {
            const filterType = args[0]?.toLowerCase()
            if (filterType === 'unreads' || filterType === 'silenced' || filterType === 'inbox') {
                context.setActiveFilter(filterType)
            }
        }
    }
] 