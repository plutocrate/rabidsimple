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
  const { isAuthenticated, isAdmin, logout, user } = useAuthStore()
  const location = useLocation()
  const count = itemCount()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      )}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative" style={{ height: '72px' }}>
          <Link to="/" className="font-heading text-3xl sm:text-4xl tracking-[0.1em] text-white hover:opacity-75 transition-opacity select-none">
            RABID
          </Link>

          <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
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

          <nav className="hidden md:flex lg:hidden items-center gap-6 ml-6">
            <Link to="/shop" className={cn('font-mono text-xs tracking-widest uppercase transition-colors font-semibold',
              location.pathname.startsWith('/shop') || location.pathname.startsWith('/product')
                ? 'text-white' : 'text-white/55 hover:text-white')}>
              Shop
            </Link>
            <Link to="/services" className={cn('font-mono text-xs tracking-widest uppercase transition-colors font-semibold',
              location.pathname === '/services' ? 'text-white' : 'text-white/55 hover:text-white')}>
              Services
            </Link>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {isAuthenticated && isAdmin && (
              <Link to="/dashboard" className="hidden md:block font-mono text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors">
                Admin
              </Link>
            )}
            {isAuthenticated && !isAdmin && (
              <Link to="/account" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity">
                {user?.avatar
                  ? <img src={user.avatar} alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-7 h-7 rounded-full border border-white/20 object-cover" />
                  : <div className="w-7 h-7 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                      <span className="font-mono text-[10px] text-white/60 uppercase">{user?.name?.[0] ?? 'U'}</span>
                    </div>
                }
                <span className="hidden lg:inline font-mono text-xs tracking-widest uppercase text-white/50">{user?.name?.split(' ')[0]}</span>
              </Link>
            )}
            {isAuthenticated && !isAdmin && (
              <button onClick={logout} className="hidden md:flex items-center gap-1.5 font-mono text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors">
                <LogOut className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Sign Out</span>
              </button>
            )}
            {!isAuthenticated && (
              <Link to="/auth/login" className="hidden md:block font-mono text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors">
                Sign In
              </Link>
            )}
            <button onClick={toggleCart} className="relative flex items-center justify-center w-10 h-10 text-white/65 hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-white text-black font-mono text-[10px] font-bold flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden text-white/65 hover:text-white transition-colors p-1">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — slides in from right */}
      <div className={cn(
        'fixed inset-0 z-50 md:hidden transition-all duration-300',
        menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}>
        <div
          className={cn('absolute inset-0 bg-black/60 transition-opacity duration-300', menuOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setMenuOpen(false)}
        />
        <div className={cn(
          'absolute top-0 right-0 h-full w-72 bg-[#0a0a0a] border-l border-white/8 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        )}>
          <div className="flex items-center justify-between px-6 border-b border-white/10 shrink-0" style={{ height: '72px' }}>
            <span className="font-heading text-3xl tracking-widest text-white">RABID</span>
            <button onClick={() => setMenuOpen(false)} className="text-white/50 hover:text-white p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col px-6 pt-6 gap-1 overflow-y-auto">
            {[
              { href: '/shop', label: 'Shop' },
              { href: '/services', label: 'Services' },
              ...(isAuthenticated && isAdmin ? [{ href: '/dashboard', label: 'Admin Dashboard' }] : []),
              ...(isAuthenticated && !isAdmin ? [{ href: '/account', label: user?.name?.split(' ')[0] ?? 'Account' }] : []),
              ...(!isAuthenticated ? [{ href: '/auth/login', label: 'Sign In' }] : []),
            ].map(l => (
              <Link key={l.href} to={l.href}
                className="font-mono text-sm tracking-widest uppercase text-white/65 hover:text-white py-4 border-b border-white/8 transition-colors">
                {l.label}
              </Link>
            ))}
            {isAuthenticated && !isAdmin && (
              <button onClick={() => { logout(); setMenuOpen(false) }}
                className="font-mono text-sm tracking-widest uppercase text-white/40 hover:text-white py-4 border-b border-white/8 transition-colors text-left flex items-center gap-3">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
