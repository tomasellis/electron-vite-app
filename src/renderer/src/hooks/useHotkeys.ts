import { useEffect } from 'react'

type HotkeyAction = {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
}

const isModifierMatch = (want?: boolean, actual?: boolean): boolean =>
  want === undefined || want === actual

const doesEventMatchHotkey = (e: KeyboardEvent, h: HotkeyAction): boolean => {
  return (
    e.key.toLowerCase() === h.key.toLowerCase() &&
    isModifierMatch(h.ctrl, e.ctrlKey) &&
    isModifierMatch(h.shift, e.shiftKey) &&
    isModifierMatch(h.alt, e.altKey) &&
    isModifierMatch(h.meta, e.metaKey)
  )
}

export function useHotkeys(hotkeys: HotkeyAction[]): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      for (const h of hotkeys) {
        if (doesEventMatchHotkey(e, h)) {
          e.preventDefault()
          h.action()
          break
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hotkeys])
}
