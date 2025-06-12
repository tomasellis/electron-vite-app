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

import 'dotenv/config'

let win: BrowserWindow
let sock: null | WASocket

const APP_DIR = app.getPath('userData')
const USER_DATA_DIR = path.join(APP_DIR, 'userData')
const AUDIO_DIR = path.join(USER_DATA_DIR, 'audio')
const AUTH_DIR = path.join(USER_DATA_DIR, 'auth')

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

  ipcMain.handle('transcribe-audio', async (_, audioPath) => {
    try {
      return await transcribeAudio(audioPath)
    } catch (error) {
      console.error('Error in transcription:', error)
      throw error
    }
  })


  initBaileys()

  createWindow()

  protocol.handle('app', (req) => {
    const { host, pathname } = new URL(req.url)

    if (host === 'audio') {
      const baseDir = path.join(app.getPath('userData'), 'userData', 'audio')

      const fullPath = path.join(baseDir, pathname)
      const relativePath = path.relative(baseDir, fullPath)
      const isSafe = relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)

      if (!isSafe) {
        return new Response('Access denied', {
          status: 403,
          headers: { 'content-type': 'text/plain' }
        })
      }

      if (!fs.existsSync(fullPath)) {
        return new Response('File not found', {
          status: 404,
          headers: { 'content-type': 'text/plain' }
        })
      }

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
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
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
    browser: ['Vimapp', 'Chrome', '1.0.0']
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
    console.log('Received contacts:', contacts)
    // Filter out chats without names, chats with number-only names, and specific blocked number
    const validChats = chats.filter(chat =>
      chat.name &&
      chat.id !== process.env.SELF_ID
    )
    const messagesByChat: Record<string, any[]> = {}

    validChats.forEach(chat => {
      messagesByChat[chat.id] = []
    })


    const messagePromises = messages.map(async msg => {
      const chatId = msg.key.remoteJid
      if (chatId && messagesByChat[chatId]) {
        if (!msg.message?.conversation && !msg.message?.extendedTextMessage?.text && !msg.message?.audioMessage) {
          return
        }
        if (msg.message && 'audioMessage' in msg.message && msg.message.audioMessage) {
          const audioPath = await downloadAudioMessage(msg)
          msg.message.audioMessage['localPath'] = audioPath
          msg.message.audioMessage['transcribedText'] = await transcribeAudio(audioPath)
        }
        messagesByChat[chatId].push(msg)
      }
    })

    Promise.all(messagePromises).then(() => {

      console.log('\n\n')
      console.log('finished promise messaging-history')

      storage.saveChats(validChats)
      storage.saveContacts(contacts)
      storage.saveMessages(messagesByChat)

      win.webContents.send('sync-data', {
        chats: validChats,
        contacts,
        messages: messagesByChat
      })
    })
  })

  sock.ev.on('messages.upsert', async ({ type, messages }) => {
    if (type === 'notify') {
      const messagesByChat: Record<string, any[]> = {}

      const messagePromises = messages.map(async msg => {
        const chatId = msg.key.remoteJid
        if (chatId === process.env.SELF_ID) {
          return
        }
        if (chatId) {
          // Skip messages without text or audio content
          if (!msg.message?.conversation && !msg.message?.extendedTextMessage?.text && !msg.message?.audioMessage) {
            return
          }
          if (!messagesByChat[chatId]) {
            messagesByChat[chatId] = []
          }

          if (msg.message && 'audioMessage' in msg.message && msg.message.audioMessage) {
            const audioPath = await downloadAudioMessage(msg)
            if (audioPath && msg.message && msg.message.audioMessage) {
              msg.message.audioMessage['localPath'] = audioPath
              msg.message.audioMessage['transcribedText'] = await transcribeAudio(audioPath)
            }
          }

          messagesByChat[chatId].push(msg)
        }
      })

      await Promise.all(messagePromises)

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
    const buffer = await downloadMediaMessage(
      msg,
      'buffer',
      {},
    )

    const fileName = `${msg.key.id}.ogg`
    const filePath = path.join(AUDIO_DIR, fileName)
    fs.writeFileSync(filePath, buffer)

    if (msg.message && msg.message.audioMessage) {
      msg.message.audioMessage.localPath = `app://audio/${fileName}`
    }

    return `app://audio/${fileName}`
  } catch (error) {
    console.error('Error downloading audio:', error)
    return 'Error'
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