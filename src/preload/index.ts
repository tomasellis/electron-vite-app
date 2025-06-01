import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  onQR: (callback) => ipcRenderer.on('qr', (_, data) => callback(data)),
  onReady: (callback) => ipcRenderer.on('ready', callback),
  sendMessage: (data) => ipcRenderer.send('send-message', data)
})
