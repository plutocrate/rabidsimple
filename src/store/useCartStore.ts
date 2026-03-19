/**
 * Cart store — syncs with Firestore when user is logged in.
 * - Guest: stored in localStorage only
 * - Logged in: persisted to Firestore carts/<uid>, validated against live products
 * - On login: merges guest cart with cloud cart, removes deleted products
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  isSyncing: boolean
  addItem: (product: Product, variants: Record<string, string>, price: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  total: () => number
  itemCount: () => number
  syncToCloud: (uid: string) => Promise<void>
  loadFromCloud: (uid: string) => Promise<void>
  validateCart: () => Promise<void>
}

async function fetchProductValid(productId: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'products', productId))
    if (!snap.exists()) return false
    // Also remove if explicitly marked deleted (future-proofing)
    const data = snap.data()
    if (data?.deleted === true) return false
    return true
  } catch { return true } // on network error, keep item
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,

      addItem: (product, selectedVariants, calculatedPrice) => {
        const id = `${product.id}-${JSON.stringify(selectedVariants)}`
        const maxQty = product.stockCount ?? 99
        set((state) => {
          const existing = state.items.find((i) => i.id === id)
          if (existing) {
            if (existing.quantity >= maxQty) return state
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
        // Sync after add (non-blocking)
        const uid = getCurrentUid()
        if (uid) get().syncToCloud(uid)
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
        const uid = getCurrentUid()
        if (uid) get().syncToCloud(uid)
      },

      updateQuantity: (id, qty) => {
        set((state) => {
          if (qty <= 0) return { items: state.items.filter((i) => i.id !== id) }
          const item = state.items.find((i) => i.id === id)
          const maxQty = item?.product.stockCount ?? 99
          const capped = Math.min(qty, maxQty)
          return { items: state.items.map((i) => (i.id === id ? { ...i, quantity: capped } : i)) }
        })
        const uid = getCurrentUid()
        if (uid) get().syncToCloud(uid)
      },

      clearCart: () => {
        set({ items: [] })
        const uid = getCurrentUid()
        if (uid) get().syncToCloud(uid)
      },

      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      total: () =>
        get().items.reduce((sum, i) => sum + i.calculatedPrice * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      // Save current cart to Firestore
      syncToCloud: async (uid: string) => {
        if (!uid) return
        try {
          await setDoc(doc(db, 'carts', uid), {
            items: get().items,
            updatedAt: new Date().toISOString(),
          })
        } catch (e) {
          console.warn('Cart sync failed:', e)
        }
      },

      // Load cart from Firestore and merge with local, validate products still exist
      loadFromCloud: async (uid: string) => {
        if (!uid) return
        set({ isSyncing: true })
        try {
          const snap = await getDoc(doc(db, 'carts', uid))
          if (!snap.exists()) {
            // No cloud cart — push local to cloud
            await get().syncToCloud(uid)
            return
          }

          const cloudItems: CartItem[] = snap.data().items ?? []
          const localItems = get().items

          // Merge: start with cloud, add any local items not in cloud
          const merged = [...cloudItems]
          for (const local of localItems) {
            if (!merged.find((c) => c.id === local.id)) {
              merged.push(local)
            }
          }

          // Validate — remove items whose products no longer exist in Firestore
          const validated: CartItem[] = []
          for (const item of merged) {
            const exists = await fetchProductValid(item.product.id)
            if (exists) validated.push(item)
          }

          set({ items: validated })
          await get().syncToCloud(uid)
        } catch (e) {
          console.warn('Cart load failed:', e)
        } finally {
          set({ isSyncing: false })
        }
      },

      // Validate current cart — remove deleted products
      validateCart: async () => {
        const items = get().items
        if (items.length === 0) return
        set({ isSyncing: true })
        try {
          const validated: CartItem[] = []
          for (const item of items) {
            const exists = await fetchProductValid(item.product.id)
            if (exists) validated.push(item)
          }
          if (validated.length !== items.length) {
            set({ items: validated })
            const uid = getCurrentUid()
            if (uid) get().syncToCloud(uid)
          }
        } catch (e) {
          console.warn('Cart validation failed:', e)
        } finally {
          set({ isSyncing: false })
        }
      },
    }),
    { name: 'rabid_cart', partialize: (s) => ({ items: s.items }) }
  )
)

// Helper to get current uid without circular imports
function getCurrentUid(): string | null {
  try {
    const stored = localStorage.getItem('rabid_auth')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return parsed?.state?.user?.id ?? null
  } catch { return null }
}
