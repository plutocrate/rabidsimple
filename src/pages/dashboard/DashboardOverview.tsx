import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { ordersService } from '@/lib/firestore'
import { ShoppingBag, TrendingUp, DollarSign, Package, ArrowRight } from 'lucide-react'
import type { Order } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  pending:    'border-white/18 text-white/45',
  processing: 'border-yellow-500/35 text-yellow-400/80',
  shipped:    'border-blue-400/35 text-blue-300/80',
  delivered:  'border-white/35 text-white/65',
  cancelled:  'border-red-500/35 text-red-400/70',
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-start justify-between mb-5">
        <p className="font-mono text-sm tracking-widest uppercase text-white/35 font-semibold">{label}</p>
        <Icon className="w-5 h-5 text-white/18" />
      </div>
      <p className="price-display text-3xl text-white font-bold">{value}</p>
    </div>
  )
}

export function DashboardOverview() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersService.getAll().then(setOrders).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const revenue  = orders.reduce((s, o) => s + o.total, 0)
  const total    = orders.length
  const done     = orders.filter(o => o.status === 'delivered').length
  const avg      = total ? revenue / total : 0
  const recent   = orders.slice(0, 8)

  return (
    <DashboardLayout>
      <div className="p-5 sm:p-7 lg:p-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-sm tracking-widest uppercase text-white/30 mb-2">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="font-heading text-5xl text-white">Overview</h1>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Stat icon={DollarSign} label="Revenue"   value={formatPrice(revenue)} />
          <Stat icon={ShoppingBag} label="Orders"   value={String(total)} />
          <Stat icon={Package}     label="Delivered" value={String(done)} />
          <Stat icon={TrendingUp}  label="Avg Order" value={formatPrice(avg)} />
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="font-mono text-sm tracking-widest uppercase text-white/28 font-semibold">Recent Orders</p>
          <Link to="/dashboard/orders" className="font-mono text-sm tracking-widest uppercase text-white/35 hover:text-white transition-colors flex items-center gap-1.5">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <p className="font-mono text-sm text-white/25 animate-pulse py-4">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="font-mono text-sm text-white/25 py-4">No orders yet.</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {recent.map(o => (
                <div key={o.id} className="border border-white/8 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-white/60 font-semibold">#{o.id.slice(-6).toUpperCase()}</span>
                    <span className={`font-mono text-xs tracking-widest uppercase border px-2 py-1 ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                  </div>
                  <p className="font-sans text-base font-semibold text-white/80">{o.shippingAddress?.name ?? '—'}</p>
                  <div className="flex items-center justify-between">
                    <span className="price-display text-base text-white/70 font-semibold">{formatPrice(o.total)}</span>
                    <span className="font-mono text-sm text-white/30">{new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block border border-white/10 overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Order', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-5 py-4 font-mono text-xs tracking-widest uppercase text-white/28 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map(o => (
                    <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-mono text-sm text-white/65 font-semibold">#{o.id.slice(-6).toUpperCase()}</td>
                      <td className="px-5 py-4 font-sans text-sm text-white/75">{o.shippingAddress?.name ?? '—'}</td>
                      <td className="px-5 py-4 price-display text-base text-white/75 font-semibold">{formatPrice(o.total)}</td>
                      <td className="px-5 py-4">
                        <span className={`font-mono text-xs tracking-widest uppercase border px-2.5 py-1 ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-white/35">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
