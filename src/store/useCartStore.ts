import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, variants: Record<string, string>, price: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, selectedVariants, calculatedPrice) => {
        const id = `${product.id}-${JSON.stringify(selectedVariants)}`
        const maxQty = product.stockCount ?? 99
        set((state) => {
          const existing = state.items.find((i) => i.id === id)
          if (existing) {
            if (existing.quantity >= maxQty) return state  // already at stock limit
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return {
            items: [...state.items, { id, product, quantity: 1, selectedVariants, calculatedPrice }],
          }
        })
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, qty) =>
        set((state) => {
          if (qty <= 0) return { items: state.items.filter((i) => i.id !== id) }
          const item = state.items.find((i) => i.id === id)
          const maxQty = item?.product.stockCount ?? 99
          const capped = Math.min(qty, maxQty)
          return { items: state.items.map((i) => (i.id === id ? { ...i, quantity: capped } : i)) }
        }),

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      total: () =>
        get().items.reduce((sum, i) => sum + i.calculatedPrice * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'rabid_cart' }
  )
)
