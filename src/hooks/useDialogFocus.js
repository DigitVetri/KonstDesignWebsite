import { useEffect } from 'react'

/** Confine keyboard focus to the open panel and return it to its trigger. */
export function useDialogFocus(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const previous = document.activeElement
    const focusable = () => [...el.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')].filter(node => node.getClientRects().length)
    focusable()[0]?.focus({ preventScroll: true })
    const trap = e => {
      if (e.key !== 'Tab') return
      const nodes = focusable()
      const first = nodes[0], last = nodes.at(-1)
      if (!first) { e.preventDefault(); return }
      if (e.shiftKey && (document.activeElement === first || !el.contains(document.activeElement))) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && (document.activeElement === last || !el.contains(document.activeElement))) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => {
      document.removeEventListener('keydown', trap)
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [ref])
}
