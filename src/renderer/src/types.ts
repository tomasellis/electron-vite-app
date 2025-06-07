import { Contact as BaileysContact, Chat as BaileysChat, proto } from 'baileys'

export type IncomingMessage = proto.IWebMessageInfo
export type Contact = BaileysContact
export type Chat = BaileysChat & {
    tag?: string
    isSilenced?: boolean
    isUnread?: boolean
}

export interface ChatState {
    contacts: Contact[]
    chats: Chat[]
    messages: Record<string, IncomingMessage[]>
    activeChatId: string | null
}

export type AudioMessage = (proto.Message.AudioMessage & {
    localPath?: string;
    transcribedText?: string;
}) | undefined