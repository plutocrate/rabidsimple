import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Package, LogOut, Settings, Keyboard, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',                 label: 'Overview',  icon: LayoutDashboard, exact: true },
  { href: '/dashboard/orders',          label: 'Orders',    icon: ShoppingBag },
  { href: '/dashboard/products',        label: 'Products',  icon: Package },
  { href: '/dashboard/keyboard-models', label: 'Models',    icon: Keyboard },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const location         = useLocation()
  const navigate         = useNavigate()
  const [open, setOpen]  = useState(false)

  async function handleLogout() { await logout(); navigate('/auth/login') }

  const NavContent = () => (
    <>
      <Link to="/" className="font-heading text-3xl tracking-wider text-white px-5 mb-8 block">RABID</Link>
      <p className="font-mono text-xs tracking-widest uppercase text-white/28 px-5 mb-3 font-semibold">Dashboard</p>
      <nav className="flex-1 space-y-0.5 mb-4">
        {NAV_ITEMS.map(item => {
          const active = item.exact ? location.pathname === item.href : location.pathname.startsWith(item.href)
          return (
            <Link key={item.href} to={item.href} onClick={() => setOpen(false)}
              className={cn('flex items-center gap-3.5 px-5 py-3.5 font-mono text-sm tracking-widest uppercase transition-all border-l-2',
                active ? 'bg-white/8 text-white border-white font-semibold' : 'text-white/40 hover:text-white/80 hover:bg-white/4 border-transparent'
              )}>
              <item.icon className="w-4 h-4 flex-shrink-0" />{item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/10 pt-3 space-y-0.5">
        <Link to="/dashboard/settings" onClick={() => setOpen(false)}
          className={cn('flex items-center gap-3.5 px-5 py-3.5 font-mono text-sm tracking-widest uppercase border-l-2 transition-colors',
            location.pathname === '/dashboard/settings' ? 'bg-white/8 text-white border-white font-semibold' : 'text-white/38 hover:text-white/70 border-transparent'
          )}>
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-5 py-3.5 font-mono text-sm tracking-widest uppercase text-white/38 hover:text-white/70 transition-colors border-l-2 border-transparent">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
      <div className="px-5 mt-5">
        <div className="border border-white/12 bg-white/3 px-4 py-3">
          <p className="font-mono text-xs tracking-widest uppercase text-white/28 mb-1">Logged in as</p>
          <p className="font-mono text-sm text-white/70 truncate font-semibold">{user?.name}</p>
          <p className="font-mono text-xs text-white/30 capitalize mt-0.5">{user?.role}</p>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#050505] flex grain">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-62 border-r border-white/10 flex-col py-6 fixed h-full z-10" style={{ width: 248 }}>
        <NavContent />
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-[#050505] border-b border-white/10 flex items-center justify-between px-5" style={{ height: 60 }}>
        <Link to="/" className="font-heading text-3xl tracking-wider text-white">RABID</Link>
        <button onClick={() => setOpen(v => !v)} className="text-white/50 hover:text-white transition-colors p-1">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/75" />
          <aside className="absolute top-0 left-0 h-full flex flex-col py-6 bg-[#050505] border-r border-white/12" style={{ width: 248 }}
            onClick={e => e.stopPropagation()}>
            <NavContent />
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-y-auto" style={{ marginLeft: 0, paddingTop: 60 }}
        // Desktop: offset sidebar
        {...({} as any)}>
        <div className="md:ml-[248px] md:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
