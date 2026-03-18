import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, ShoppingBag, Check, Package } from 'lucide-react'
import { ordersService } from '@/lib/firestore'
import { useAuthStore } from '@/store/useAuthStore'

type Step = 'details' | 'review' | 'confirmed'

export function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const cartTotal = total()
  const [step, setStep] = useState<Step>('details')
  const [placing, setPlacing] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: user?.name ?? '', email: user?.email ?? '',
    line1: '', line2: '', city: '', state: '', zip: '', country: 'India',
    notes: '',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  if (items.length === 0 && step !== 'confirmed') {
    return (
      <PageLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-5">
          <ShoppingBag className="w-16 h-16 text-white/15" />
          <p className="font-display text-3xl italic text-white/40">Your cart is empty.</p>
          <Link to="/shop"><Button size="lg">Browse Shop</Button></Link>
        </div>
      </PageLayout>
    )
  }

  async function placeOrder() {
    setPlacing(true)
    try {
      const order = await ordersService.create({
        userId: user?.id ?? 'guest',
        items: items,
        total: cartTotal,
        status: 'pending',
        shippingAddress: {
          name: form.name, line1: form.line1, line2: form.line2,
          city: form.city, state: form.state, zip: form.zip, country: form.country,
        },
      })
      setOrderId(order.id)
      clearCart()
      setStep('confirmed')
    } catch (err: any) {
      alert(err?.message ?? 'Order failed. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (step === 'confirmed') {
    return (
      <PageLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-5 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 border-2 border-white/30 flex items-center justify-center">
              <Check className="w-10 h-10 text-white/70" />
            </div>
            <div>
              <h1 className="font-heading text-6xl text-white mb-3">Order Placed</h1>
              <p className="font-display text-xl italic text-white/55 max-w-md">
                We've received your order. We'll be in touch within 24 hours to confirm your build.
              </p>
            </div>
            {orderId && (
              <p className="font-mono text-sm text-white/35 border border-white/10 px-4 py-2">
                Order #{orderId.slice(-8).toUpperCase()}
              </p>
            )}
            <div className="flex gap-4 mt-2">
              <Link to="/shop"><Button size="lg" variant="outline">Back to Shop</Button></Link>
              <Link to="/"><Button size="lg">Home</Button></Link>
            </div>
          </motion.div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-24">

        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => step === 'review' ? setStep('details') : navigate('/shop')}
            className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="font-mono text-sm tracking-widest uppercase text-white/35 mb-0.5">
              Step {step === 'details' ? '1' : '2'} of 2
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl text-white">
              {step === 'details' ? 'Your Details' : 'Review Order'}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-16">

          {/* Left — form or review */}
          <div>
            {step === 'details' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <p className="font-mono text-sm tracking-widest uppercase text-white/40 mb-5">Contact</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2 block">Full Name *</Label>
                      <Input value={form.name} onChange={set('name')} required placeholder="Arjun Sharma" className="h-12 text-base" />
                    </div>
                    <div>
                      <Label className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2 block">Email *</Label>
                      <Input type="email" value={form.email} onChange={set('email')} required placeholder="arjun@example.com" className="h-12 text-base" />
                    </div>
                  </div>
                </div>

                <Separator className="opacity-15" />

                <div>
                  <p className="font-mono text-sm tracking-widest uppercase text-white/40 mb-5">Shipping Address</p>
                  <div className="space-y-4">
                    <div>
                      <Label className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2 block">Address Line 1 *</Label>
                      <Input value={form.line1} onChange={set('line1')} required placeholder="123 MG Road, Flat 4B" className="h-12 text-base" />
                    </div>
                    <div>
                      <Label className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2 block">Address Line 2</Label>
                      <Input value={form.line2} onChange={set('line2')} placeholder="Landmark (optional)" className="h-12 text-base" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2 block">City *</Label>
                        <Input value={form.city} onChange={set('city')} required placeholder="Bangalore" className="h-12 text-base" />
                      </div>
                      <div>
                        <Label className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2 block">State *</Label>
                        <Input value={form.state} onChange={set('state')} required placeholder="Karnataka" className="h-12 text-base" />
                      </div>
                      <div>
                        <Label className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2 block">PIN *</Label>
                        <Input value={form.zip} onChange={set('zip')} required placeholder="560001" className="h-12 text-base" />
                      </div>
                    </div>
                    <div>
                      <Label className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2 block">Country</Label>
                      <Input value={form.country} onChange={set('country')} placeholder="India" className="h-12 text-base" />
                    </div>
                  </div>
                </div>

                <Separator className="opacity-15" />

                <div>
                  <Label className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2 block">Build Notes (optional)</Label>
                  <textarea value={form.notes} onChange={set('notes')} rows={3}
                    placeholder="Any special requests for your build…"
                    className="w-full border border-white/15 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/35 resize-none transition-colors" />
                </div>

                <Button size="xl" className="w-full"
                  disabled={!form.name || !form.email || !form.line1 || !form.city || !form.state || !form.zip}
                  onClick={() => setStep('review')}>
                  Review Order →
                </Button>
              </motion.div>
            )}

            {step === 'review' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="border border-white/10 p-6 space-y-4">
                  <p className="font-mono text-sm tracking-widest uppercase text-white/40">Shipping to</p>
                  <div className="font-mono text-base text-white/75 leading-relaxed space-y-1">
                    <p className="text-white font-semibold">{form.name}</p>
                    <p>{form.email}</p>
                    <p>{form.line1}{form.line2 && `, ${form.line2}`}</p>
                    <p>{form.city}, {form.state} — {form.zip}</p>
                    <p>{form.country}</p>
                    {form.notes && <p className="text-white/45 mt-2 pt-2 border-t border-white/8">{form.notes}</p>}
                  </div>
                </div>

                <div className="border border-white/10 p-6 space-y-1">
                  <p className="font-mono text-sm tracking-widest uppercase text-white/40 mb-4">Payment</p>
                  <div className="border border-white/15 bg-white/3 px-5 py-4">
                    <p className="font-mono text-sm text-white/60 mb-1">Payment on Delivery / Bank Transfer</p>
                    <p className="font-mono text-xs text-white/35 leading-relaxed">
                      We'll send bank transfer details by email after confirming your order. COD available in select cities.
                    </p>
                  </div>
                </div>

                <Button size="xl" className="w-full gap-3" onClick={placeOrder} disabled={placing}>
                  <Package className="w-5 h-5" />
                  {placing ? 'Placing Order…' : 'Confirm & Place Order'}
                </Button>
                <p className="font-mono text-xs text-white/30 text-center leading-relaxed">
                  By placing this order you agree to our{' '}
                  <Link to="/terms" className="underline underline-offset-2 hover:text-white/55">Terms of Service</Link>.
                  No payment is charged upfront.
                </p>
              </motion.div>
            )}
          </div>

          {/* Right — order summary */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="border border-white/10 p-6">
              <p className="font-mono text-sm tracking-widest uppercase text-white/40 mb-5">Order Summary</p>
              <div className="space-y-4 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-14 h-14 bg-white/5 border border-white/8 shrink-0 flex items-center justify-center">
                      {item.product.images[0]
                        ? <img src={item.product.images[0]} className="w-full h-full object-cover" alt="" />
                        : <ShoppingBag className="w-5 h-5 text-white/15" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-lg text-white truncate">{item.product.name}</p>
                      <p className="font-mono text-xs text-white/40 mt-0.5">Qty: {item.quantity}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.selectedVariants).slice(0, 2).map(([k, v]) => (
                          <span key={k} className="font-mono text-[10px] tracking-widest uppercase border border-white/12 text-white/40 px-1.5 py-0.5">{v}</span>
                        ))}
                      </div>
                    </div>
                    <span className="price-display text-sm text-white shrink-0">{formatPrice(item.calculatedPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator className="opacity-15 mb-4" />
              <div className="space-y-2 mb-2">
                <div className="flex justify-between font-mono text-sm text-white/50">
                  <span>Subtotal</span><span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between font-mono text-sm text-white/50">
                  <span>Shipping</span><span className="text-white/35">Calculated after order</span>
                </div>
              </div>
              <Separator className="opacity-15 mb-4" />
              <div className="flex justify-between items-center">
                <span className="font-mono text-base tracking-widest uppercase text-white/60">Total</span>
                <span className="price-display text-2xl text-white">{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
