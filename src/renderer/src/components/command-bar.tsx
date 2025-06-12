import { useEffect, useState, useRef } from 'react'
import { COMMANDS } from '../commands'
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from './ui/command'
import { Chat, IncomingMessage } from '../types'
import { User } from 'lucide-react'

interface CommandBarProps {
    isOpen: boolean
    onClose: () => void
    onExecute: (command: string) => void
    chats: any[]
    contacts: {
        id: string
        name?: string
        notify?: string
        imgUrl?: string | null
    }[]
    messages: Record<string, IncomingMessage[]>
    onChatSelect: (chat: any) => void
}

export default function CommandBar({ isOpen, onClose, onExecute, chats, contacts = [], messages = {}, onChatSelect }: CommandBarProps) {
    const [search, setSearch] = useState('')
    const commandListRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && e.key === ':' && e.ctrlKey && e.shiftKey) {
                e.preventDefault()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    useEffect(() => {
        const el = commandListRef.current
        if (el) {
            requestAnimationFrame(() => {
                el.scrollTop = 0
            })
        }
    }, [search])

    return (
        <CommandDialog open={isOpen} onOpenChange={onClose} className="dark">
            <Command loop className="dark h-full">
                <CommandInput
                    placeholder="Search chats or type a command..."
                    value={search}
                    onValueChange={setSearch}
                    onKeyDown={(e) => {
                        if (e.key === 'Backspace' && search === '') {
                            onClose()
                        }
                    }}
                />
                <CommandList ref={commandListRef} className="min-h-[300px] max-h-[300px]">
                    {chats.length > 0 && (
                        <CommandGroup
                            heading="Chats"
                            className="flex-1 overflow-y-auto"
                        >
                            {chats.map((chat) => {
                                const contact = contacts?.find(c => c.id === chat.id)
                                const chatMessages = messages[chat.id] || []
                                const lastMessage = chatMessages[0]
                                const isAudioMessage = lastMessage?.message?.audioMessage
                                const lastMessageContent = isAudioMessage
                                    ? '🎵 Audio'
                                    : lastMessage?.message?.conversation || ''

                                return (
                                    <CommandItem
                                        key={chat.id}
                                        onSelect={() => {
                                            onChatSelect(chat)
                                            onClose()
                                        }}
                                    >
                                        <div className="flex items-center space-x-3 w-full">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {contact?.imgUrl && contact.imgUrl !== 'changed' ? (
                                                    <img src={contact.imgUrl} alt={contact.name || chat.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium truncate">
                                                        {contact?.name || contact?.notify || chat.name || chat.id.split('@')[0]}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400 truncate">
                                                    {lastMessage?.key?.fromMe ? 'You: ' : ''}{lastMessageContent}
                                                </p>
                                            </div>
                                        </div>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    )}
                    {COMMANDS.length > 0 && (
                        <CommandGroup heading="Actions" className="min-h-[content]">
                            {COMMANDS.map((cmd) => (
                                <CommandItem
                                    key={cmd.name}
                                    onSelect={() => {
                                        const searchParts = search.trim().split(' ')
                                        const firstPart = Number(searchParts[0])
                                        const lastPart = Number(searchParts[searchParts.length - 1])

                                        if (!isNaN(lastPart) && (cmd.name === 'up' || cmd.name === 'down')) {
                                            onExecute(`${cmd.name} ${lastPart}`)
                                        } else if (!isNaN(firstPart) && (cmd.name === 'up' || cmd.name === 'down')) {
                                            onExecute(`${cmd.name} ${firstPart}`)
                                        } else {
                                            onExecute(cmd.name)
                                        }
                                        onClose()
                                    }}
                                    keywords={['actions', 'commands', 'command', 'action', cmd.name, '1', '2', '3', '4', '5', '6', '7', '8', '9', '0']}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span>{cmd.name}</span>
                                        <div className="flex gap-1">
                                            {cmd.shortcut.map((key, index) => (
                                                <span
                                                    key={index}
                                                    className="min-w-[25px] h-[25px] flex items-center justify-center bg-gray-700 rounded text-xs px-1 font-bold"
                                                >
                                                    {key.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>

            </Command>
        </CommandDialog>
    )
} 