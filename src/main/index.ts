import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { DisconnectReason, makeWASocket, useMultiFileAuthState, WASocket } from 'baileys'
import QRCode from 'qrcode'
import { storage } from './storage'

let win: BrowserWindow
let sock: null | WASocket

function createWindow(): void {
  win = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  win.loadURL('http://localhost:5173')

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()
  initBaileys()

  app.on('activate', function () {
    //macos
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// quit all except macos
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

async function initBaileys() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const generateQR = async (qr) => {
    try {
      return await QRCode.toDataURL(qr)
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw error
    }
  }

  sock = makeWASocket({
    auth: state,
    browser: ['WhatsApp Electron', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', () => {
    console.log('saving new creds, after update')
    saveCreds()
  })

  sock.ev.on('connection.update', async (update) => {
    const { qr, connection, lastDisconnect } = update
    console.log('connection update: ', { qr, connection })

    if (qr) {
      const qrDataUrl = await generateQR(qr)
      console.log(await QRCode.toString(qr, { type: 'terminal' }))
      win.webContents.send('qr', qrDataUrl)
    }
    if (connection === 'open') {
      win.webContents.send('ready')

      // Load cached data
      const cachedChats = storage.loadChats()
      const cachedContacts = storage.loadContacts()
      const cachedMessages = storage.loadMessages()

      if (cachedChats.length > 0 || cachedContacts.length > 0) {
        win.webContents.send('sync-data', {
          chats: cachedChats,
          contacts: cachedContacts,
          messages: cachedMessages
        })
      }
    }

    if (
      connection === 'close' &&
      (lastDisconnect?.error as any)?.output?.statusCode === DisconnectReason.restartRequired
    ) {
      console.log('>>>>>>>>>>>> restart required, reconnecting')
      initBaileys()
    }

    if (
      connection === 'close' &&
      (lastDisconnect?.error as any)?.output?.statusCode === DisconnectReason.loggedOut
    ) {
      const authDir = path.resolve('../../auth/')
      fs.rmSync(authDir, { recursive: true, force: true })
    }
  })

  sock.ev.on('messaging-history.set', ({ chats, contacts, messages, syncType }) => {
    console.log({ chats, contacts, messages, syncType })

    // Filter out chats without names
    const validChats = chats.filter(chat => chat.name)
    const messagesByChat: Record<string, any[]> = {}

    validChats.forEach(chat => {
      messagesByChat[chat.id] = []
    })

    messages.forEach(msg => {
      const chatId = msg.key.remoteJid
      if (chatId && messagesByChat[chatId]) {
        messagesByChat[chatId].push(msg)
      }
    })

    /* storage.saveChats(validChats)
    storage.saveContacts(contacts)
    storage.saveMessages(messagesByChat) */

    win.webContents.send('sync-data', {
      chats: validChats,
      contacts,
      messages: messagesByChat
    })
  })

  sock.ev.on('messages.upsert', ({ type, messages }) => {
    if (type === 'notify') {
      console.log('\n\n')
      console.log('MESSAGES UPSERT>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
      console.log({ type, messages })

      // Organize new messages by chat
      const messagesByChat: Record<string, any[]> = {}

      messages.forEach(msg => {
        const chatId = msg.key.remoteJid
        if (chatId) {
          // Create array for this chat if it doesn't exist
          if (!messagesByChat[chatId]) {
            messagesByChat[chatId] = []
          }
          // Add message to its specific chat array
          messagesByChat[chatId].push(msg)
        }
      })

      // Update storage with new messages
      /* const currentMessages = storage.loadMessages()
      Object.entries(messagesByChat).forEach(([chatId, msgs]) => {
        if (!currentMessages[chatId]) {
          currentMessages[chatId] = []
        }
        currentMessages[chatId] = [...msgs, ...currentMessages[chatId]]
      })
      storage.saveMessages(currentMessages) */

      console.log('\n\n\n')
      console.log('updated messages to send and orderred', { messages })

      // Send only the new messages to renderer
      win.webContents.send('new-messages', messagesByChat)
    }
  })
}

ipcMain.on('send-message', async (event, { jid, message }) => {
  if (!sock) {
    console.log('no socket')
    return
  }

  if (!jid || !message) {
    console.error('Invalid message data:', { jid, message })
    return
  }

  const fullJid = jid.includes('@') ? jid : `${jid}@s.whatsapp.net`

  console.log('Sending message via Baileys:', {
    to: fullJid,
    message
  })

  try {
    await sock.sendMessage(fullJid, { text: message })
  } catch (error) {
    console.error('Error sending message:', error)
  }
})
