declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export interface ElectronAPI {
  onQR: (callback: (code: string) => void) => void
  onReady: (callback: () => void) => void
  sendMessage: (data: { number: string; message: string }) => void
}

