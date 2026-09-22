import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDialogFocus } from '../hooks/useDialogFocus.js'
import { EMAIL } from '../data/studio.js'

const ITEMS = [
  { label: 'Home', target: '#top' },
  { label: 'About', target: '#about' },
  { label: 'Services', target: '#services' },
  { label: 'Projects', target: '#projects' },
  { label: 'Contact', target: '#start-project' },
]
function MobileMenu({ onClose }) {
  const panel = useRef(null)
  useDialogFocus(panel)
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const key = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', key)
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', key) }
  }, [onClose])
  return createPortal(<div ref={panel} id="mobile-navigation" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation">
    <div className="mobile-menu-top"><span className="eyebrow">Konst Design</span><button onClick={onClose} aria-label="Close navigation">Close <span aria-hidden="true">×</span></button></div>
    <nav aria-label="Mobile navigation">{ITEMS.map((item, i) => <a key={item.target} href={item.target} onClick={onClose}><span>0{i + 1}</span>{item.label}<span aria-hidden="true">↗</span></a>)}</nav>
    <a className="mobile-menu-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
  </div>, document.body)
}
export function Navigation() {
  const [open, setOpen] = useState(false)
  return <>
    <nav className="desktop-navigation" aria-label="Primary">{ITEMS.map(item => <a key={item.target} href={item.target}>{item.label}</a>)}</nav>
    <button className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)}>Menu <span aria-hidden="true"><i /><i /></span></button>
    {open && <MobileMenu onClose={() => setOpen(false)} />}
  </>
}
