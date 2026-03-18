import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { formatPrice, cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

export function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const cartTotal = total()

  return (
    <>
      <div onClick={toggleCart}
        className={cn('fixed inset-0 z-50 bg-black/65 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')} />
      <aside className={cn(
        'fixed top-0 right-0 z-50 h-full w-full sm:max-w-[420px] bg-[#070707] border-l border-white/10 flex flex-col transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex items-center justify-between px-6 h-[72px] border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-white/55" />
            <span className="font-mono text-base tracking-widest uppercase text-white/70 font-semibold">Cart ({items.length})</span>
          </div>
          <button onClick={toggleCart} className="text-white/35 hover:text-white transition-colors p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8">
              <ShoppingBag className="w-14 h-14 text-white/12" />
              <p className="font-display text-3xl text-white/30 italic">Cart is empty</p>
              <button onClick={toggleCart} className="font-mono text-sm tracking-widest uppercase text-white/35 hover:text-white transition-colors underline underline-offset-4">
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="px-6 space-y-6">
              {items.map(item => (
                <li key={item.id} className="flex gap-4">
                  <div className="w-18 h-18 bg-white/4 border border-white/10 flex-shrink-0 flex items-center justify-center" style={{ width: 72, height: 72 }}>
                    {item.product.images?.[0]
                      ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      : <ShoppingBag className="w-6 h-6 text-white/18" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xl text-white truncate">{item.product.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.entries(item.selectedVariants).map(([k, v]) => (
                        <span key={k} className="font-mono text-xs tracking-widest uppercase border border-white/15 text-white/40 px-2 py-0.5">{v}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 border border-white/18 flex items-center justify-center text-white/45 hover:text-white hover:border-white/45 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-base text-white w-5 text-center">{item.quantity}</span>
                        {(() => {
                          const maxQty = item.product.stockCount ?? 99
                          const atMax = item.quantity >= maxQty
                          return (
                            <button
                              onClick={() => !atMax && updateQuantity(item.id, item.quantity + 1)}
                              disabled={atMax}
                              title={atMax ? `Only ${maxQty} in stock` : undefined}
                              className={cn('w-7 h-7 border flex items-center justify-center transition-colors',
                                atMax
                                  ? 'border-white/8 text-white/18 cursor-not-allowed'
                                  : 'border-white/18 text-white/45 hover:text-white hover:border-white/45'
                              )}>
                              <Plus className="w-3 h-3" />
                            </button>
                          )
                        })()}
                      </div>
                      <span className="price-display text-base text-white font-semibold">{formatPrice(item.calculatedPrice * item.quantity)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-white/22 hover:text-white/65 transition-colors flex-shrink-0 mt-0.5 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/10 p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="font-mono text-base tracking-widest uppercase text-white/45">Subtotal</span>
              <span className="price-display text-2xl text-white font-bold">{formatPrice(cartTotal)}</span>
            </div>
            <p className="font-mono text-sm text-white/28 tracking-wide">Shipping & taxes at checkout</p>
            <Separator />
            <Link to={isAuthenticated ? '/checkout' : '/auth/login'} onClick={toggleCart}>
              <Button className="w-full text-base font-bold h-14">Checkout →</Button>
            </Link>
            <button onClick={toggleCart} className="w-full font-mono text-sm tracking-widest uppercase text-white/35 hover:text-white transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
