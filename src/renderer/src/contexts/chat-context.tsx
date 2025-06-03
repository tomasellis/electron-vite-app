import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Message, ChatState } from '../types'
import { Chat, Contact } from 'baileys'

type ChatAction =
    | { type: 'SET_CONTACTS'; payload: Contact[] }
    | { type: 'ADD_CONTACT'; payload: Contact }
    | { type: 'UPDATE_CONTACT'; payload: Contact }
    | { type: 'DELETE_CONTACT'; payload: string }
    | { type: 'SET_CHATS'; payload: Chat[] }
    | { type: 'ADD_CHAT'; payload: Chat }
    | { type: 'UPDATE_CHAT'; payload: Chat }
    | { type: 'DELETE_CHAT'; payload: string }
    | { type: 'SET_MESSAGES'; payload: { chatId: string; messages: Message[] } }
    | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
    | { type: 'UPDATE_MESSAGE'; payload: { chatId: string; messageId: string; updates: Partial<Message> } }
    | { type: 'SET_ACTIVE_CHAT'; payload: string | null }

const initialState: ChatState = {
    contacts: [],
    chats: [],
    messages: {},
    activeChatId: null
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case 'SET_CONTACTS':
            return { ...state, contacts: action.payload }
        case 'ADD_CONTACT':
            return { ...state, contacts: [...state.contacts, action.payload] }
        case 'UPDATE_CONTACT':
            return {
                ...state,
                contacts: state.contacts.map(contact =>
                    contact.id === action.payload.id ? action.payload : contact
                )
            }
        case 'DELETE_CONTACT':
            return {
                ...state,
                contacts: state.contacts.filter(contact => contact.id !== action.payload)
            }
        case 'SET_CHATS':
            return { ...state, chats: action.payload }
        case 'ADD_CHAT':
            return { ...state, chats: [...state.chats, action.payload] }
        case 'UPDATE_CHAT':
            return {
                ...state,
                chats: state.chats.map(chat =>
                    chat.id === action.payload.id ? action.payload : chat
                )
            }
        case 'DELETE_CHAT':
            return {
                ...state,
                chats: state.chats.filter(chat => chat.id !== action.payload)
            }
        case 'SET_MESSAGES':
            console.log('Chat Context: Setting messages', {
                chatId: action.payload.chatId,
                messageCount: action.payload.messages.length,
                firstMessage: action.payload.messages[0]
            })
            const existingMessages = state.messages[action.payload.chatId] || []
            const newMessages = action.payload.messages.filter(
                newMsg => !existingMessages.some(existingMsg => existingMsg.key.id === newMsg.key.id)
            )
            return {
                ...state,
                messages: {
                    ...state.messages,
                    [action.payload.chatId]: [...existingMessages, ...newMessages]
                }
            }
        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: {
                    ...state.messages,
                    [action.payload.chatId]: [
                        ...(state.messages[action.payload.chatId] || []),
                        action.payload.message
                    ]
                }
            }
        case 'UPDATE_MESSAGE':
            return {
                ...state,
                messages: {
                    ...state.messages,
                    [action.payload.chatId]: state.messages[action.payload.chatId]?.map(msg =>
                        msg.key.id === action.payload.messageId
                            ? { ...msg, ...action.payload.updates }
                            : msg
                    ) || []
                }
            }
        case 'SET_ACTIVE_CHAT':
            return { ...state, activeChatId: action.payload }
        default:
            return state
    }
}

const ChatContext = createContext<{
    state: ChatState
    dispatch: React.Dispatch<ChatAction>
} | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(chatReducer, initialState)

    return (
        <ChatContext.Provider value={{ state, dispatch }}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider')
    }
    return context
} 