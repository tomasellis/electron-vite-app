import { contextBridge, ipcRenderer } from 'electron'
import { Chat, Contact, IncomingMessage } from '../renderer/src/types'

contextBridge.exposeInMainWorld('electronAPI', {
  onQR: (callback: (code: string) => void) => {
    ipcRenderer.on('qr', (_event, code) => callback(code))
  },
  onReady: (callback: () => void) => {
    ipcRenderer.on('ready', () => callback())
  },
  onSyncData: (callback: (data: { chats: Chat[], contacts: Contact[], messages: Record<string, IncomingMessage[]> }) => void) => {
    ipcRenderer.on('sync-data', (_event, data) => callback(data))
  },
  onNewMessages: (callback: (messages: Record<string, IncomingMessage[]>) => void) => {
    ipcRenderer.on('new-messages', (_event, messages) => callback(messages))
  },
  reloadSync: () => {
    ipcRenderer.send('reload-sync')
  },
  sendMessage: (data: { number: string; message: string }) => {
    ipcRenderer.send('send-message', data)
  },
  transcribeAudio: (path) => ipcRenderer.invoke('transcribe-audio', path)
})
