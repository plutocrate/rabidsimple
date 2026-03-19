/**
 * AccountPage — user profile, order history, and account management.
 * Route: /account
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/useAuthStore'
import { ordersService } from '@/lib/firestore'
import { formatPrice } from '@/lib/utils'
import type { Order } from '@/types'
import {
  User, Package, LogOut, ChevronRight,
  ShoppingBag, Clock, CheckCircle, Truck,
  XCircle, AlertCircle, Copy, Check
} from 'lucide-react'

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: 'Pending',    icon: Clock,        color: 'text-yellow-400/80  border-yellow-500/25  bg-yellow-900/10' },
  processing: { label: 'Processing', icon: AlertCircle,  color: 'text-blue-400/80    border-blue-500/25    bg-blue-900/10'   },
  shipped:    { label: 'Shipped',    icon: Truck,        color: 'text-purple-400/80  border-purple-500/25  bg-purple-900/10' },
  delivered:  { label: 'Delivered',  icon: CheckCircle,  color: 'text-green-400/80   border-green-500/25   bg-green-900/10'  },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      color: 'text-red-400/80     border-red-500/25     bg-red-900/10'    },
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase border px-2.5 py-1 ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

// ─── Order card ───────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [copied, setCopied] = useState(false)
  const shortId = order.id.slice(-8).toUpperCase()

  function copyId() {
    navigator.clipboard.writeText(order.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/10 hover:border-white/20 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Package className="w-4 h-4 text-white/30 shrink-0" />
          <div>
            <button onClick={copyId}
              className="flex items-center gap-1.5 font-mono text-sm text-white/70 hover:text-white transition-colors">
              Order #{shortId}
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/20" />}
            </button>
            <p className="font-mono text-[10px] text-white/30 mt-0.5">
              {(() => { try { const d = new Date(order.createdAt); return isNaN(d.getTime()) ? 'Recent' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return 'Recent' } })()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="price-display text-base text-white font-semibold">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-white/4">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3">
            <div className="w-12 h-12 bg-white/4 border border-white/8 shrink-0 flex items-center justify-center overflow-hidden">
              {item.product.images?.[0]
                ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                : <ShoppingBag className="w-4 h-4 text-white/20" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-base font-medium text-white truncate">{item.product.name}</p>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {Object.entries(item.selectedVariants).map(([k, v]) => (
                  <span key={k} className="font-mono text-[9px] tracking-widest uppercase border border-white/12 text-white/35 px-1.5 py-0.5">{v}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-xs text-white/40">×{item.quantity}</p>
              <p className="price-display text-sm text-white/70">{formatPrice(item.calculatedPrice * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="px-5 py-3 border-t border-white/6 flex items-start gap-2">
          <Truck className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
          <p className="font-mono text-[10px] text-white/35 leading-relaxed">
            {order.shippingAddress.name} · {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function AccountPage() {
  const { user, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders]       = useState<Order[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders')

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth/login'); return }
    if (!user?.id) return
    ordersService.getByUserId(user.id)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user?.id, isAuthenticated, navigate])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  if (!user) return null

  const totalSpent = orders.reduce((s, o) => s + o.total, 0)
  const completedOrders = orders.filter(o => o.status === 'delivered').length

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-28 pb-24">

        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-10 flex-wrap gap-5">
          <div className="flex items-center gap-4">
            {user.avatar
              ? <img src={user.avatar} alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-14 h-14 rounded-full border border-white/15 object-cover" />
              : <div className="w-14 h-14 rounded-full border border-white/15 bg-white/5 flex items-center justify-center">
                  <User className="w-6 h-6 text-white/30" />
                </div>
            }
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-white">{user.name}</h1>
              <p className="font-mono text-sm text-white/35 mt-0.5">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-white/40 hover:text-white">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-white/6 mb-10">
          {[
            { label: 'Orders', value: orders.length },
            { label: 'Delivered', value: completedOrders },
            { label: 'Total Spent', value: formatPrice(totalSpent), isPrice: true },
          ].map(stat => (
            <div key={stat.label} className="bg-[#080808] px-5 py-5 text-center">
              <p className={`${stat.isPrice ? 'price-display text-xl' : 'font-heading text-4xl'} text-white mb-1`}>
                {stat.value}
              </p>
              <p className="font-mono text-[10px] tracking-widest uppercase text-white/30">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-white/8 mb-8">
          {(['orders', 'profile'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`font-mono text-sm tracking-widest uppercase pb-3 border-b-2 transition-colors ${
                activeTab === tab ? 'border-white text-white' : 'border-transparent text-white/30 hover:text-white/60'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loading ? (
              <p className="font-mono text-sm text-white/25 animate-pulse">Loading orders…</p>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
                <ShoppingBag className="w-14 h-14 text-white/10" />
                <p className="font-sans text-xl font-medium text-white/30">No orders yet</p>
                <Link to="/shop">
                  <Button variant="outline" size="sm">Browse Shop</Button>
                </Link>
              </div>
            ) : (
              orders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </div>
        )}

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-md">
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: user.name },
                { label: 'Email', value: user.email },
                { label: 'Account Type', value: user.role === 'admin' ? 'Administrator' : user.role === 'team' ? 'Team Member' : 'Customer' },
                { label: 'Member Since', value: (() => {
              try {
                const d = new Date(user.createdAt)
                return isNaN(d.getTime()) ? 'Early member' : d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
              } catch { return 'Early member' }
            })() },
              ].map(field => (
                <div key={field.label} className="flex justify-between items-center py-3 border-b border-white/6">
                  <span className="font-mono text-xs tracking-widest uppercase text-white/35">{field.label}</span>
                  <span className="font-mono text-sm text-white/70">{field.value}</span>
                </div>
              ))}
            </div>

            <Separator className="opacity-10" />

            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-3">Account</p>
              <button onClick={handleLogout}
                className="flex items-center gap-2 font-mono text-sm text-red-400/60 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
                Sign out of all devices
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </PageLayout>
  )
}
