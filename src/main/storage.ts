import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { Chat, Contact, IncomingMessage } from '../renderer/src/types'

// Create userData directory in the app folder
const APP_DIR = app.getPath('userData')
const USER_DATA_DIR = path.join(APP_DIR, 'userData')

if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true })
}

const AUDIO_DIR = path.join(USER_DATA_DIR, 'audio')
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true })
}

const AUTH_DIR = path.join(USER_DATA_DIR, 'auth')
if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true })
}


const CHATS_FILE = path.join(USER_DATA_DIR, 'chats.json')
const CONTACTS_FILE = path.join(USER_DATA_DIR, 'contacts.json')
const MESSAGES_FILE = path.join(USER_DATA_DIR, 'messages.json')

const sortMessagesByTimestamp = (messages: IncomingMessage[]): IncomingMessage[] => {
    return messages.sort((a, b) => {
        const timeA = typeof a.messageTimestamp === 'number' ? a.messageTimestamp : a.messageTimestamp?.low || 0
        const timeB = typeof b.messageTimestamp === 'number' ? b.messageTimestamp : b.messageTimestamp?.low || 0
        return timeB - timeA
    })
}

export const storage = {
    saveChats: (newChats: Chat[]) => {
        const existingChats = storage.loadChats()
        const updatedChats = [...existingChats]

        newChats.forEach(newChat => {
            const existingIndex = updatedChats.findIndex(chat => chat.id === newChat.id)
            if (existingIndex === -1) {

                updatedChats.push(newChat)
            } else {

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
                updatedContacts.push(newContact)
            } else {

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
        const updatedMessages = { ...existingMessages, ...newMessages }



        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(updatedMessages, null, 2))
    },

    loadMessages: (): Record<string, IncomingMessage[]> => {
        try {
            if (fs.existsSync(MESSAGES_FILE)) {
                return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'))
            }
        } catch (error) {
            console.error('Error loading messages:', error)
        }
        return {}
    }
} 