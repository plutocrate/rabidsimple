import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { CartDrawer } from './CartDrawer'
import { MailingListPopup } from './MailingListPopup'
import { useSiteSettings } from '@/store/useSiteSettings'

interface PageLayoutProps {
  children: React.ReactNode
  hideFooter?: boolean
}

const NAVBAR_H = 72

// ── Same palette as LandingViewer ──────────────────────────────────────────
const PALETTE_CASES = [
  '#e2ddd8', '#141414', '#f2ece0', '#ccd4dc',
  '#1e3a5f', '#5c1a1a', '#1a3a1e', '#3a3e44',
  '#6b4226', '#080808',
]

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ]
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  const r = Math.round((ar + (br - ar) * t) * 255)
  const g = Math.round((ag + (bg - ag) * t) * 255)
  const bl = Math.round((ab + (bb - ab) * t) * 255)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function useLerpColor() {
  const [color, setColor] = useState(PALETTE_CASES[0])
  const activeRef = useRef(0)
  const tRef = useRef(0)
  const fromRef = useRef(PALETTE_CASES[0])
  const toRef = useRef(PALETTE_CASES[1])

  useEffect(() => {
    let raf: number
    let last = performance.now()
    function tick(now: number) {
      const dt = (now - last) / 1000
      last = now
      tRef.current = Math.min(tRef.current + dt * 0.32, 1)
      setColor(lerpHex(fromRef.current, toRef.current, easeInOut(tRef.current)))
      if (tRef.current >= 1) {
        const next = (activeRef.current + 1) % PALETTE_CASES.length
        fromRef.current = toRef.current
        toRef.current = PALETTE_CASES[(next + 1) % PALETTE_CASES.length]
        tRef.current = 0
        activeRef.current = next
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return color
}

export function PageLayout({ children, hideFooter }: PageLayoutProps) {
  const { pathname } = useLocation()
  const { settings, fetch, loaded, bannerDismissed, dismissBanner } = useSiteSettings()
  const accentColor = useLerpColor()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    fetch()
  }, [])

  const showBanner =
    loaded &&
    settings.announcementEnabled === true &&
    !!settings.announcementBanner?.trim() &&
    !bannerDismissed

  return (
    <div className="min-h-screen flex flex-col bg-background grain">
      <Navbar />

      {/* Banner — fixed overlay, does NOT push content down */}
      <div className="fixed left-0 right-0 z-40" style={{ top: NAVBAR_H }}>
        <AnimatePresence>
          {showBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <button
                onClick={() => dismissBanner()}
                className="w-full bg-background hover:bg-white/[0.03] transition-colors flex items-center justify-center px-4 py-2 cursor-pointer"
                style={{
                  borderTop: `1px solid ${accentColor}66`,
                  borderBottom: `1px solid ${accentColor}66`,
                }}
                aria-label="Dismiss banner"
              >
                {/* Lerping left accent line */}
                <span
                  className="hidden sm:block w-px h-3 shrink-0 mr-4 transition-colors duration-1000"
                  style={{ backgroundColor: `${accentColor}99` }}
                />
                <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-foreground/55 text-center leading-relaxed">
                  {settings.announcementBanner}
                </p>
                <span
                  className="hidden sm:block w-px h-3 shrink-0 ml-4 transition-colors duration-1000"
                  style={{ backgroundColor: `${accentColor}99` }}
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed top padding — just navbar height, banner overlays content */}
      <div className="flex flex-col flex-1" style={{ paddingTop: NAVBAR_H }}>
        <main>{children}</main>
        {!hideFooter && <Footer />}
      </div>

      <CartDrawer />
      <MailingListPopup />
    </div>
  )
}
