import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { CartDrawer } from './CartDrawer'

interface PageLayoutProps {
  children: React.ReactNode
  hideFooter?: boolean
}

export function PageLayout({ children, hideFooter }: PageLayoutProps) {
  const { pathname } = useLocation()

  // Scroll to top on every page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-background grain">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <CartDrawer />
    </div>
  )
}
