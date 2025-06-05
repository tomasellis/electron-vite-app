import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import path, { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { DisconnectReason, makeWASocket, useMultiFileAuthState, WASocket, downloadMediaMessage } from 'baileys'
import QRCode from 'qrcode'
import { storage } from './storage'
import { pathToFileURL } from 'url'
import { run } from './transformers'
import { transcribeAudio } from './transcription'

let win: BrowserWindow
let sock: null | WASocket

// Register protocol schemes before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true,
      standard: true,
    },
  },
]);

function createWindow(): void {
  win = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  })

  win.loadURL('http://localhost:5173')

  win.on('ready-to-show', () => {
    win.show()
    win.webContents.openDevTools()
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

  // Add a handler for the transcribe-audio event
  ipcMain.handle('transcribe-audio', async (_, audioPath) => {
    try {
      return await transcribeAudio(audioPath)
    } catch (error) {
      console.error('Error in transcription:', error)
      throw error
    }
  })

  createWindow()
  initBaileys()

  protocol.handle('app', (req) => {
    const { host, pathname } = new URL(req.url)

    if (host === 'audio') {
      // Base directory for audio files
      const baseDir = path.join(app.getPath('userData'), 'audio')

      // Resolve the full path
      const fullPath = path.join(baseDir, pathname)

      // Security check: ensure the path is within our audio directory
      const relativePath = path.relative(baseDir, fullPath)
      const isSafe = relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)

      if (!isSafe) {
        return new Response('Access denied', {
          status: 403,
          headers: { 'content-type': 'text/plain' }
        })
      }

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        return new Response('File not found', {
          status: 404,
          headers: { 'content-type': 'text/plain' }
        })
      }

      // Serve the file
      return net.fetch(pathToFileURL(fullPath).toString())
    }

    return new Response('Not found', {
      status: 404,
      headers: { 'content-type': 'text/plain' }
    })
  })

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

    if (qr) {
      const qrDataUrl = await generateQR(qr)
      win.webContents.send('qr', qrDataUrl)
    }
    if (connection === 'open') {
      win.webContents.send('ready')

      // Load cached data
      const cachedChats = storage.loadChats()
      const cachedContacts = storage.loadContacts()
      const cachedMessages = storage.loadMessages()

      if (cachedChats.length > 0 || cachedContacts.length > 0) {
        console.log('\nSending cached data to renderer:')
        Object.entries(cachedMessages).forEach(([chatId, msgs]) => {
          console.log(`\nMessages for chat ${chatId}:`)
          msgs.forEach(msg => {
            console.log('Message timestamp:', {
              raw: msg.messageTimestamp,
              type: typeof msg.messageTimestamp,
              parsed: typeof msg.messageTimestamp === 'number'
                ? new Date(msg.messageTimestamp * 1000).toISOString()
                : new Date((msg.messageTimestamp?.low || 0) * 1000).toISOString()
            })
          })
        })

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
        // Download audio if present
        if (msg.message && 'audioMessage' in msg.message && msg.message.audioMessage) {
          downloadAudioMessage(msg).then(audioPath => {
            if (audioPath && msg.message && msg.message.audioMessage) {
              msg.message.audioMessage['localPath'] = audioPath
            }
          })
        }
        messagesByChat[chatId].push(msg)
      }
    })

    console.log('\nSending history data to renderer:')
    Object.entries(messagesByChat).forEach(([chatId, msgs]) => {
      console.log(`\nMessages for chat ${chatId}:`)
      msgs.forEach(msg => {
        console.log('Message timestamp:', {
          raw: msg.messageTimestamp,
          type: typeof msg.messageTimestamp,
          parsed: typeof msg.messageTimestamp === 'number'
            ? new Date(msg.messageTimestamp * 1000).toISOString()
            : new Date((msg.messageTimestamp?.low || 0) * 1000).toISOString()
        })
      })
    })

    storage.saveChats(validChats)
    storage.saveContacts(contacts)
    storage.saveMessages(messagesByChat)

    win.webContents.send('sync-data', {
      chats: validChats,
      contacts,
      messages: messagesByChat
    })
  })

  sock.ev.on('messages.upsert', async ({ type, messages }) => {
    if (type === 'notify') {
      console.log('\n\n')
      console.log('MESSAGES UPSERT>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
      console.log({ type, messages })

      // Organize new messages by chat
      const messagesByChat: Record<string, any[]> = {}

      for (const msg of messages) {
        const chatId = msg.key.remoteJid
        if (chatId) {
          // Create array for this chat if it doesn't exist
          if (!messagesByChat[chatId]) {
            messagesByChat[chatId] = []
          }

          // Download audio if present
          if (msg.message && 'audioMessage' in msg.message && msg.message.audioMessage) {
            const audioPath = await downloadAudioMessage(msg)
            if (audioPath && msg.message && msg.message.audioMessage) {
              msg.message.audioMessage['localPath'] = audioPath
            }
          }

          // Add message to its specific chat array
          messagesByChat[chatId].push(msg)
        }
      }

      console.log('\nSending new messages to renderer:')
      Object.entries(messagesByChat).forEach(([chatId, msgs]) => {
        console.log(`\nMessages for chat ${chatId}:`)
        msgs.forEach(msg => {
          console.log('Message timestamp:', {
            raw: msg.messageTimestamp,
            type: typeof msg.messageTimestamp,
            parsed: typeof msg.messageTimestamp === 'number'
              ? new Date(msg.messageTimestamp * 1000).toISOString()
              : new Date((msg.messageTimestamp?.low || 0) * 1000).toISOString()
          })
        })
      })

      // Update storage with new messages
      const currentMessages = storage.loadMessages()
      Object.entries(messagesByChat).forEach(([chatId, msgs]) => {
        if (!currentMessages[chatId]) {
          currentMessages[chatId] = []
        }
        currentMessages[chatId] = [...msgs, ...currentMessages[chatId]]
      })
      storage.saveMessages(currentMessages)

      win.webContents.send('new-messages', messagesByChat)
    }
  })
}

async function downloadAudioMessage(msg: any) {
  try {
    if (msg.message && 'audioMessage' in msg.message && msg.message.audioMessage) {
      const buffer = await downloadMediaMessage(
        msg,
        'buffer',
        {},
      )

      const audioDir = path.join(app.getPath('userData'), 'audio')
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true })
      }

      const fileName = `${msg.key.id}.ogg`
      const filePath = path.join(audioDir, fileName)
      fs.writeFileSync(filePath, buffer)

      return `app://audio/${fileName}`
    }
    return null
  } catch (error) {
    console.error('Error downloading audio:', error)
    return null
  }
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
  const timestamp = Math.floor(Date.now() / 1000)

  console.log('Sending message via Baileys:', {
    to: fullJid,
    message
  })

  try {
    const result = await sock.sendMessage(fullJid, { text: message })
    const messageId = result?.key?.id

    // Create a message object with the real ID
    const sentMessage = {
      key: {
        remoteJid: fullJid,
        fromMe: true,
        id: messageId || `temp-${timestamp}`
      },
      message: {
        conversation: message
      },
      messageTimestamp: timestamp,
      status: 0 // PENDING
    }

    // Save to storage
    const currentMessages = storage.loadMessages()
    if (!currentMessages[fullJid]) {
      currentMessages[fullJid] = []
    }
    currentMessages[fullJid] = [sentMessage, ...currentMessages[fullJid]]
    storage.saveMessages(currentMessages)
  } catch (error) {
    console.error('Error sending message:', error)
  }
})