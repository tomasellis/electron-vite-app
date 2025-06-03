import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { DisconnectReason, makeWASocket, useMultiFileAuthState, WASocket } from 'baileys'
import QRCode from 'qrcode'

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

      // Load test data
      const testData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../testdata/sync-3.json'), 'utf-8'))
      const messagesByChat: Record<string, any[]> = {}

      testData.chats.forEach(chat => {
        messagesByChat[chat.id] = []
      })

      testData.messages.forEach(msg => {
        const chatId = msg.key.remoteJid
        if (chatId && messagesByChat[chatId]) {
          messagesByChat[chatId].push(msg)
        }
      })

      /* win.webContents.send('sync-data', {
        chats: testData.chats,
        contacts: testData.contacts,
        messages: messagesByChat
      }) */
    }

    if (
      connection === 'close' &&
      lastDisconnect?.error?.output?.statusCode === DisconnectReason.restartRequired
    ) {
      console.log('>>>>>>>>>>>> restart required, reconnecting')
      initBaileys()
    }

    if (
      connection === 'close' &&
      lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut
    ) {
      const authDir = path.resolve('../../auth/')
      fs.rmSync(authDir, { recursive: true, force: true })
    }
  })

  sock.ev.on('messaging-history.set', ({ chats, contacts, messages, syncType }) => {
    console.log({ chats, contacts, messages, syncType })

    // Load test data
    const testData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../testdata/sync-3.json'), 'utf-8'))
    const messagesByChat: Record<string, any[]> = {}

    testData.chats.forEach(chat => {
      messagesByChat[chat.id] = []
    })

    testData.messages.forEach(msg => {
      const chatId = msg.key.remoteJid
      if (chatId && messagesByChat[chatId]) {
        messagesByChat[chatId].push(msg)
      }
    })

    win.webContents.send('sync-data', {
      chats: testData.chats,
      contacts: testData.contacts,
      messages: messagesByChat
    })
  })

  sock.ev.on('messages.upsert', ({ type, messages }) => {
    if (type == 'notify') {
      // new messages
      for (const message of messages) {
        // messages is an array, do not just handle the first message, you will miss messages
        console.log('new message', { message })
      }
    } else {
      console.log('old upserrt: ', { type, messages })
    }
  })

  sock.ev.on('error', (err) => {
    console.error('whatsapp connection error:', err)
    win.webContents.send('error', 'connection error ocurred')
  })
}

ipcMain.on('send-message', async (event, { number, message }) => {
  if (!sock) {
    console.log('no socket')
    return
  }

  const jid = number + '@s.whatsapp.net'
  await sock.sendMessage(jid, { text: message })
})
