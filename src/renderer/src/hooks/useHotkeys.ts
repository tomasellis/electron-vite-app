import { useEffect } from 'react'

type HotkeyAction = {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
}

export function useHotkeys(hotkeys: HotkeyAction[]): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      hotkeys.forEach((h) => {
        const match =
          e.key.toLowerCase() === h.key.toLowerCase() &&
          !!h.ctrl === e.ctrlKey &&
          !!h.shift === e.shiftKey &&
          !!h.alt === e.altKey &&
          !!h.meta === e.metaKey

        if (match) {
          e.preventDefault()
          h.action()
        }
      })
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hotkeys])
}
