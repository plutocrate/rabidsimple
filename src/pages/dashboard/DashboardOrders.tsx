import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Input } from '@/components/ui/input'
import { formatPrice, cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { ordersService } from '@/lib/firestore'
import type { Order } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  pending:    'border-white/18 text-white/45',
  processing: 'border-yellow-500/35 text-yellow-400/80',
  shipped:    'border-blue-400/35 text-blue-300/80',
  delivered:  'border-white/35 text-white/65',
  cancelled:  'border-red-500/35 text-red-400/70',
}
const ALL_STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']
const NEXT_STATUS: Record<string, Order['status']> = {
  pending: 'processing', processing: 'shipped', shipped: 'delivered',
}

export function DashboardOrders() {
  const [orders, setOrders]       = useState<Order[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [updating, setUpdating]   = useState<string | null>(null)

  useEffect(() => {
    ordersService.getAll().then(setOrders).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function advance(o: Order) {
    const next = NEXT_STATUS[o.status]
    if (!next) return
    setUpdating(o.id)
    try {
      await ordersService.updateStatus(o.id, next)
      setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: next } : x))
    } finally { setUpdating(null) }
  }

  const filtered = orders.filter(o => {
    const name = o.shippingAddress?.name ?? ''
    return (name.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)) &&
      (filter === 'all' || o.status === filter)
  })

  return (
    <DashboardLayout>
      <div className="p-5 sm:p-7 lg:p-10">
        <div className="mb-8">
          <p className="font-mono text-sm tracking-widest uppercase text-white/30 mb-2">Manage</p>
          <h1 className="font-heading text-5xl text-white">Orders</h1>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer or ID…" className="pl-11 h-12 text-base" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ALL_STATUSES.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={cn('font-mono text-sm tracking-widest uppercase px-3.5 py-2 border transition-all',
                  filter === s ? 'border-white/50 bg-white/8 text-white font-semibold' : 'border-white/12 text-white/38 hover:text-white/60'
                )}>{s}</button>
            ))}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {loading ? <p className="font-mono text-sm text-white/25 animate-pulse py-4">Loading…</p>
          : filtered.length === 0 ? <p className="font-sans text-xl text-white/25 py-8 text-center">No orders found</p>
          : filtered.map(o => (
            <div key={o.id} className="border border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-white/65 font-semibold">#{o.id.slice(-6).toUpperCase()}</span>
                <span className={`font-mono text-xs tracking-widest uppercase border px-2 py-1 ${STATUS_STYLES[o.status]}`}>{o.status}</span>
              </div>
              <p className="font-sans text-base font-semibold text-white/85">{o.shippingAddress?.name ?? '—'}</p>
              <p className="font-mono text-sm text-white/38">{o.shippingAddress?.city}</p>
              <div className="flex items-center justify-between">
                <span className="price-display text-lg text-white/75 font-semibold">{formatPrice(o.total)}</span>
                <span className="font-mono text-sm text-white/30">{new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              {NEXT_STATUS[o.status] && (
                <button onClick={() => advance(o)} disabled={updating === o.id}
                  className="w-full font-mono text-sm tracking-widest uppercase text-white/40 hover:text-white border border-white/12 hover:border-white/35 py-2.5 transition-all disabled:opacity-30">
                  {updating === o.id ? '…' : `Mark as ${NEXT_STATUS[o.status]}`}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block border border-white/10 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/8">
                {['Order', 'Customer', 'Total', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="px-5 py-4 font-mono text-xs tracking-widest uppercase text-white/28 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center font-mono text-sm text-white/25 animate-pulse">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center font-sans text-xl text-white/25">No orders found</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-4 font-mono text-sm text-white/65 font-semibold">#{o.id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-4">
                    <p className="font-sans text-base font-semibold text-white/80">{o.shippingAddress?.name ?? '—'}</p>
                    <p className="font-mono text-sm text-white/30">{o.shippingAddress?.city}</p>
                  </td>
                  <td className="px-5 py-4 price-display text-base text-white/75 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-5 py-4">
                    <span className={`font-mono text-xs tracking-widest uppercase border px-2.5 py-1 ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-white/35">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-4">
                    {NEXT_STATUS[o.status] && (
                      <button onClick={() => advance(o)} disabled={updating === o.id}
                        className="font-mono text-xs tracking-widest uppercase text-white/28 hover:text-white border border-white/10 hover:border-white/35 px-3 py-1.5 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30">
                        {updating === o.id ? '…' : `→ ${NEXT_STATUS[o.status]}`}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
