import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, X, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, toggleCart } = useCartStore()
  const { isAuthenticated, isAdmin, logout } = useAuthStore()
  const location = useLocation()
  const count = itemCount()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-18 flex items-center justify-between" style={{ height: '72px' }}>
          <Link to="/" className="font-heading text-4xl tracking-[0.1em] text-white hover:opacity-75 transition-opacity select-none">
            RABID
          </Link>

          {/* Desktop nav — only 2 links */}
          <nav className="hidden md:flex items-center gap-10">
            <Link to="/shop" className={cn('font-mono text-sm tracking-widest uppercase transition-colors font-semibold',
              location.pathname.startsWith('/shop') || location.pathname.startsWith('/product')
                ? 'text-white' : 'text-white/55 hover:text-white')}>
              Shop
            </Link>
            <Link to="/services" className={cn('font-mono text-sm tracking-widest uppercase transition-colors font-semibold',
              location.pathname === '/services' ? 'text-white' : 'text-white/55 hover:text-white')}>
              Services
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            {isAuthenticated && isAdmin && (
              <Link to="/dashboard" className="hidden md:block font-mono text-sm tracking-widest uppercase text-white/40 hover:text-white transition-colors">
                Admin
              </Link>
            )}
            {isAuthenticated && !isAdmin && (
              <button onClick={logout} className="hidden md:flex items-center gap-1.5 font-mono text-sm tracking-widest uppercase text-white/40 hover:text-white transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            )}
            {!isAuthenticated && (
              <Link to="/auth/login" className="hidden md:block font-mono text-sm tracking-widest uppercase text-white/40 hover:text-white transition-colors">
                Sign In
              </Link>
            )}
            <button onClick={toggleCart} className="relative flex items-center justify-center w-10 h-10 text-white/65 hover:text-white transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-white text-black font-mono text-[10px] font-bold flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden text-white/65 hover:text-white transition-colors p-1">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <div className={cn(
        'fixed inset-0 z-40 bg-black flex flex-col md:hidden transition-all duration-300',
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}>
        <div className="flex items-center justify-between px-6 border-b border-white/10" style={{ height: '72px' }}>
          <Link to="/" className="font-heading text-4xl tracking-widest text-white">RABID</Link>
          <button onClick={() => setMenuOpen(false)} className="text-white/50 hover:text-white p-1"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex flex-col px-8 pt-8 gap-2">
          {[
            { href: '/shop', label: 'Shop' },
            { href: '/services', label: 'Services' },
            ...(isAuthenticated && isAdmin ? [{ href: '/dashboard', label: 'Admin Dashboard' }] : []),
            ...(!isAuthenticated ? [{ href: '/auth/login', label: 'Sign In' }] : []),
          ].map(l => (
            <Link key={l.href} to={l.href}
              className="font-mono text-xl tracking-widest uppercase text-white/65 hover:text-white py-5 border-b border-white/8 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
