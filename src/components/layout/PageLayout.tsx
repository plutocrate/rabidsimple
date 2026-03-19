import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { CartDrawer } from './CartDrawer'
import { useSiteSettings } from '@/store/useSiteSettings'
import { X } from 'lucide-react'

interface PageLayoutProps {
  children: React.ReactNode
  hideFooter?: boolean
}

// Navbar is fixed at 72px height. Banner (~40px) sits right below it.
const NAVBAR_H = 72
const BANNER_H = 40

export function PageLayout({ children, hideFooter }: PageLayoutProps) {
  const { pathname } = useLocation()
  const { settings, fetch, loaded, bannerDismissed, dismissBanner } = useSiteSettings()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  // Always re-fetch on mount so fresh Firestore data is reflected
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

      {/* Banner — fixed, sits directly below the fixed navbar */}
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
              <div className="
                border-b border-white/8
                bg-[#0e0e0e]
                flex items-center justify-between
                px-6 sm:px-10
                py-2.5
              ">
                {/* Left accent */}
                <div className="w-px h-3 bg-white/20 shrink-0 mr-4 hidden sm:block" />

                {/* Text */}
                <p className="flex-1 font-mono text-[11px] tracking-[0.18em] uppercase text-white/55 text-center leading-relaxed">
                  {settings.announcementBanner}
                </p>

                {/* Dismiss */}
                <button
                  onClick={() => dismissBanner()}
                  className="ml-4 shrink-0 w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/*
        Push page content below navbar + optional banner.
        Animate padding-top so page content slides down smoothly when banner appears.
      */}
      <motion.div
        className="flex flex-col flex-1"
        animate={{ paddingTop: showBanner ? NAVBAR_H + BANNER_H : NAVBAR_H }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <main className="flex-1">{children}</main>
        {!hideFooter && <Footer />}
      </motion.div>

      <CartDrawer />
    </div>
  )
}
