import { create } from 'zustand'
import type { Product } from '@/types'
import { productsService } from '@/lib/firestore'

interface ProductStore {
  products: Product[]
  activeFilters: string[]
  isLoading: boolean
  error: string | null
  fetchProducts: (category?: string) => Promise<void>
  toggleFilter: (tagValue: string) => void
  clearFilters: () => void
  filteredProducts: () => Product[]
  getBySlug: (slug: string) => Product | undefined
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  activeFilters: [],
  isLoading: false,
  error: null,

  fetchProducts: async (category) => {
    set({ isLoading: true, error: null })
    try {
      const products = category
        ? await productsService.getByCategory(category)
        : await productsService.getAll()
      set({ products })
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load products', products: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  toggleFilter: (tagValue) =>
    set(state => ({
      activeFilters: state.activeFilters.includes(tagValue)
        ? state.activeFilters.filter(f => f !== tagValue)
        : [...state.activeFilters, tagValue],
    })),

  clearFilters: () => set({ activeFilters: [] }),

  filteredProducts: () => {
    const { products, activeFilters } = get()
    if (activeFilters.length === 0) return products
    return products.filter(p =>
      activeFilters.every(f => p.tags?.some(t => t.value === f))
    )
  },

  getBySlug: (slug) => get().products.find(p => p.slug === slug),
}))
