import { Chat, Contact, IncomingMessage } from '../renderer/src/types'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export interface ElectronAPI {
  onQR: (callback: (code: string) => void) => void
  onReady: (callback: () => void) => void
  onSyncData: (callback: (data: { chats: Chat[]; contacts: Contact[]; messages: Record<string, IncomingMessage[]> }) => void) => void
  onNewMessages: (callback: (messages: Record<string, IncomingMessage[]>) => void) => void
  reloadSync: () => void
  sendMessage: (data: { jid: string; message: string }) => void
}

