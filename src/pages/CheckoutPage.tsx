import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/useCartStore'
import { ordersService } from '@/lib/firestore'
import { formatPrice } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { Check, ShoppingBag } from 'lucide-react'

export function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate  = useNavigate()
  const cartTotal = total()

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  })
  const [placing, setPlacing] = useState(false)
  const [placed,  setPlaced]  = useState(false)
  const [error,   setError]   = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setPlacing(true); setError('')
    try {
      await ordersService.create({
        userId: user?.id ?? 'guest',
        items,
        total: cartTotal,
        status: 'pending',
        shippingAddress: {
          name: form.name, line1: form.line1, line2: form.line2,
          city: form.city, state: form.state, zip: form.zip, country: form.country,
        },
      })
      clearCart()
      setPlaced(true)
    } catch (e: any) {
      setError(e?.message ?? 'Order failed. Please try again.')
    } finally { setPlacing(false) }
  }

  if (items.length === 0 && !placed) {
    return (
      <PageLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
          <ShoppingBag className="w-16 h-16 text-white/15" />
          <h1 className="font-display text-4xl italic text-white/40">Your cart is empty</h1>
          <Link to="/shop"><Button size="lg" className="text-base px-10 h-14">Browse Shop</Button></Link>
        </div>
      </PageLayout>
    )
  }

  if (placed) {
    return (
      <PageLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-white/8 border border-white/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="font-display text-5xl italic text-white">Order Placed</h1>
          <p className="font-mono text-base text-white/45 max-w-md leading-relaxed">
            We'll be in touch within 24 hours to confirm your build details and timeline.
          </p>
          <Link to="/shop"><Button size="lg" className="text-base px-10 h-14 mt-2">Back to Shop</Button></Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-28 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2">Place Order</p>
          <h1 className="font-heading text-6xl leading-none text-white mb-10">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
            {/* Form */}
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Contact */}
              <div>
                <p className="font-mono text-sm tracking-widest uppercase text-white/45 mb-4 font-semibold">Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-mono text-xs tracking-widest uppercase text-white/35 mb-1.5 block">Full Name *</Label>
                    <Input value={form.name} onChange={set('name')} required placeholder="Arjun Sharma" className="h-12 text-base" />
                  </div>
                  <div>
                    <Label className="font-mono text-xs tracking-widest uppercase text-white/35 mb-1.5 block">Email *</Label>
                    <Input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" className="h-12 text-base" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="font-mono text-xs tracking-widest uppercase text-white/35 mb-1.5 block">Phone</Label>
                    <Input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className="h-12 text-base" />
                  </div>
                </div>
              </div>

              <Separator className="opacity-15" />

              {/* Shipping */}
              <div>
                <p className="font-mono text-sm tracking-widest uppercase text-white/45 mb-4 font-semibold">Shipping Address</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="font-mono text-xs tracking-widest uppercase text-white/35 mb-1.5 block">Address Line 1 *</Label>
                    <Input value={form.line1} onChange={set('line1')} required placeholder="Flat / House No, Street" className="h-12 text-base" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="font-mono text-xs tracking-widest uppercase text-white/35 mb-1.5 block">Address Line 2</Label>
                    <Input value={form.line2} onChange={set('line2')} placeholder="Area, Landmark (optional)" className="h-12 text-base" />
                  </div>
                  <div>
                    <Label className="font-mono text-xs tracking-widest uppercase text-white/35 mb-1.5 block">City *</Label>
                    <Input value={form.city} onChange={set('city')} required placeholder="Mumbai" className="h-12 text-base" />
                  </div>
                  <div>
                    <Label className="font-mono text-xs tracking-widest uppercase text-white/35 mb-1.5 block">State *</Label>
                    <Input value={form.state} onChange={set('state')} required placeholder="Maharashtra" className="h-12 text-base" />
                  </div>
                  <div>
                    <Label className="font-mono text-xs tracking-widest uppercase text-white/35 mb-1.5 block">PIN Code *</Label>
                    <Input value={form.zip} onChange={set('zip')} required placeholder="400001" className="h-12 text-base" />
                  </div>
                  <div>
                    <Label className="font-mono text-xs tracking-widest uppercase text-white/35 mb-1.5 block">Country</Label>
                    <Input value={form.country} onChange={set('country')} className="h-12 text-base" />
                  </div>
                </div>
              </div>

              {error && (
                <p className="font-mono text-sm text-red-400/80 border border-red-500/25 bg-red-900/10 px-4 py-3">{error}</p>
              )}

              <Button type="submit" disabled={placing} size="lg" className="w-full h-16 text-lg font-bold">
                {placing ? 'Placing Order…' : `Place Order · ${formatPrice(cartTotal)}`}
              </Button>

              <p className="font-mono text-sm text-white/25 leading-relaxed">
                By placing your order you agree to our{' '}
                <Link to="/terms" className="underline hover:text-white/50 transition-colors">Terms</Link> and{' '}
                <Link to="/privacy" className="underline hover:text-white/50 transition-colors">Privacy Policy</Link>.
                Payment is handled offline — we'll invoice you after confirming your build.
              </p>
            </form>

            {/* Order summary */}
            <div className="lg:sticky lg:top-28 h-fit">
              <div className="border border-white/12 p-6 bg-white/[0.02]">
                <p className="font-mono text-sm tracking-widest uppercase text-white/45 mb-5 font-semibold">Order Summary</p>
                <ul className="space-y-4 mb-6">
                  {items.map(item => (
                    <li key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 bg-white/4 border border-white/8 flex-shrink-0 overflow-hidden">
                        {item.product.images?.[0]
                          ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-white/18" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-lg text-white leading-tight truncate">{item.product.name}</p>
                        <p className="font-mono text-xs text-white/35 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="price-display text-base text-white/70 shrink-0 font-semibold">
                        {formatPrice(item.calculatedPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <Separator className="mb-5 opacity-15" />
                <div className="flex justify-between items-center">
                  <span className="font-mono text-base tracking-widest uppercase text-white/45">Total</span>
                  <span className="price-display text-2xl text-white font-bold">{formatPrice(cartTotal)}</span>
                </div>
                <p className="font-mono text-xs text-white/28 mt-3 leading-relaxed">
                  Shipping calculated after order confirmation. Typically 5–10 business days within India.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
