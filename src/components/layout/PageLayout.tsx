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

export function PageLayout({ children, hideFooter }: PageLayoutProps) {
  const { pathname } = useLocation()
  const { settings, fetch, loaded } = useSiteSettings()
  const [bannerDismissed, setBannerDismissed] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    fetch()
  }, [])

  const showBanner = loaded &&
    settings.announcementEnabled &&
    !!settings.announcementBanner?.trim() &&
    !bannerDismissed

  return (
    <div className="min-h-screen flex flex-col bg-background grain">
      <Navbar />

      {/* Announcement banner — sits flush below navbar */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden z-40 relative"
          >
            <div className="
              border-b border-white/8
              bg-[#0a0a0a]
              flex items-center justify-between
              px-6 sm:px-10
              py-3
            ">
              {/* Left accent line */}
              <div className="w-px h-3 bg-white/20 shrink-0 mr-4 hidden sm:block" />

              {/* Text */}
              <p className="flex-1 font-mono text-[11px] tracking-[0.18em] uppercase text-white/55 text-center leading-relaxed">
                {settings.announcementBanner}
              </p>

              {/* Dismiss */}
              <button
                onClick={() => setBannerDismissed(true)}
                className="ml-4 shrink-0 w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <CartDrawer />
    </div>
  )
}
