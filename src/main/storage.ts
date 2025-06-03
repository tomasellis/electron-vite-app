import fs from 'fs'
import path from 'path'
import { Chat, Contact, IncomingMessage } from '../renderer/src/types'

const STORAGE_DIR = path.join(process.cwd(), 'userData')
const CHATS_FILE = path.join(STORAGE_DIR, 'chats.json')
const CONTACTS_FILE = path.join(STORAGE_DIR, 'contacts.json')
const MESSAGES_FILE = path.join(STORAGE_DIR, 'messages.json')

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
}

// Helper function to sort messages by timestamp
const sortMessagesByTimestamp = (messages: IncomingMessage[]): IncomingMessage[] => {
    return messages.sort((a, b) => {
        const timeA = typeof a.messageTimestamp === 'number' ? a.messageTimestamp : a.messageTimestamp?.low || 0
        const timeB = typeof b.messageTimestamp === 'number' ? b.messageTimestamp : b.messageTimestamp?.low || 0
        return timeB - timeA // Sort in descending order (newest first)
    })
}

export const storage = {
    saveChats: (newChats: Chat[]) => {
        const existingChats = storage.loadChats()
        const updatedChats = [...existingChats]

        newChats.forEach(newChat => {
            const existingIndex = updatedChats.findIndex(chat => chat.id === newChat.id)
            if (existingIndex === -1) {
                // Add new chat if it doesn't exist
                updatedChats.push(newChat)
            } else {
                // Update existing chat with new data
                updatedChats[existingIndex] = { ...updatedChats[existingIndex], ...newChat }
            }
        })

        fs.writeFileSync(CHATS_FILE, JSON.stringify(updatedChats, null, 2))
    },

    loadChats: (): Chat[] => {
        try {
            if (fs.existsSync(CHATS_FILE)) {
                return JSON.parse(fs.readFileSync(CHATS_FILE, 'utf-8'))
            }
        } catch (error) {
            console.error('Error loading chats:', error)
        }
        return []
    },

    saveContacts: (newContacts: Contact[]) => {
        const existingContacts = storage.loadContacts()
        const updatedContacts = [...existingContacts]

        newContacts.forEach(newContact => {
            const existingIndex = updatedContacts.findIndex(contact => contact.id === newContact.id)
            if (existingIndex === -1) {
                // Add new contact if it doesn't exist
                updatedContacts.push(newContact)
            } else {
                // Update existing contact with new data
                updatedContacts[existingIndex] = { ...updatedContacts[existingIndex], ...newContact }
            }
        })

        fs.writeFileSync(CONTACTS_FILE, JSON.stringify(updatedContacts, null, 2))
    },

    loadContacts: (): Contact[] => {
        try {
            if (fs.existsSync(CONTACTS_FILE)) {
                return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf-8'))
            }
        } catch (error) {
            console.error('Error loading contacts:', error)
        }
        return []
    },

    saveMessages: (newMessages: Record<string, IncomingMessage[]>) => {
        const existingMessages = storage.loadMessages()
        const updatedMessages = { ...existingMessages }

        Object.entries(newMessages).forEach(([chatId, msgs]) => {
            console.log('\nSaving messages for chat:', chatId)
            msgs.forEach(msg => {
                console.log('Message timestamp:', {
                    raw: msg.messageTimestamp,
                    type: typeof msg.messageTimestamp,
                    parsed: typeof msg.messageTimestamp === 'number'
                        ? new Date(msg.messageTimestamp * 1000).toISOString()
                        : new Date((msg.messageTimestamp?.low || 0) * 1000).toISOString()
                })
            })

            if (!updatedMessages[chatId]) {
                // If chat doesn't exist, add all messages
                updatedMessages[chatId] = sortMessagesByTimestamp(msgs)
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
                // Sort messages by timestamp after merging
                updatedMessages[chatId] = sortMessagesByTimestamp(uniqueMessages)
            }
        })

        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(updatedMessages, null, 2))
    },

    loadMessages: (): Record<string, IncomingMessage[]> => {
        try {
            if (fs.existsSync(MESSAGES_FILE)) {
                const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'))
                // Sort messages by timestamp when loading
                Object.keys(messages).forEach(chatId => {
                    console.log('\nLoading messages for chat:', chatId)
                    // Convert string timestamps back to numbers
                    messages[chatId] = messages[chatId].map(msg => ({
                        ...msg,
                        messageTimestamp: Number(msg.messageTimestamp)
                    }))
                    messages[chatId].forEach(msg => {
                        console.log('Message timestamp:', {
                            raw: msg.messageTimestamp,
                            type: typeof msg.messageTimestamp,
                            parsed: typeof msg.messageTimestamp === 'number'
                                ? new Date(msg.messageTimestamp * 1000).toISOString()
                                : new Date((msg.messageTimestamp?.low || 0) * 1000).toISOString()
                        })
                    })
                    messages[chatId] = sortMessagesByTimestamp(messages[chatId])
                })
                return messages
            }
        } catch (error) {
            console.error('Error loading messages:', error)
        }
        return {}
    }
} 