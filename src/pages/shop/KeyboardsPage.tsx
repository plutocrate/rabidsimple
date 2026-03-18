import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { FilterBar } from '@/components/shop/FilterBar'
import { ProductCard } from '@/components/shop/ProductCard'
import { useProductStore } from '@/store/useProductStore'
import { Separator } from '@/components/ui/separator'

const SIZE_GROUPS = [
  { key: 'split',  label: 'Split / Ergonomic', tags: ['split', 'trackball'] },
  { key: 'small',  label: 'Small (≤48 keys)',  tags: ['42-keys', '48-keys'] },
  { key: 'medium', label: 'Medium (48–65)',     tags: ['64-keys', 'medium'] },
  { key: 'full',   label: 'Full Size',          tags: ['full'] },
]

export function KeyboardsPage() {
  const { fetchProducts, filteredProducts, activeFilters } = useProductStore()
  useEffect(() => { fetchProducts('keyboard') }, [fetchProducts])

  const products  = filteredProducts().filter(p => p.category === 'keyboard')
  const showFlat  = activeFilters.length > 0
  const grouped   = SIZE_GROUPS
    .map(g => ({ ...g, products: products.filter(p => p.tags.some(t => g.tags.includes(t.value))) }))
    .filter(g => g.products.length > 0)

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-28 sm:pt-32 pb-24 sm:pb-32">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-10 sm:mb-12">
          <p className="font-mono text-xs tracking-widest uppercase text-white/35 mb-3">Collection</p>
          <h1 className="font-display text-[clamp(2.8rem,7vw,5rem)] italic text-white leading-none mb-4">
            Keyboards
          </h1>
          <p className="font-mono text-sm text-white/45 max-w-lg leading-relaxed">
            Every board is handwired, QMK/ZMK ready, and built to outlast the keyboard industry's trend cycles.
          </p>
        </motion.div>

        <FilterBar />

        <div className="py-4">
          <p className="font-mono text-xs text-white/35 tracking-widest">
            {products.length} {products.length === 1 ? 'product' : 'products'}
            {activeFilters.length > 0 && ` · ${activeFilters.length} filter${activeFilters.length > 1 ? 's' : ''} active`}
          </p>
        </div>

        {showFlat ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(p => <motion.div key={p.id} layout><ProductCard product={p} /></motion.div>)}
          </motion.div>
        ) : (
          <div className="space-y-20 sm:space-y-28">
            {grouped.map(group => (
              <section key={group.key}>
                <div className="flex items-center gap-4 mb-7 sm:mb-8">
                  <h2 className="font-display text-2xl sm:text-3xl text-white/70 italic whitespace-nowrap">{group.label}</h2>
                  <Separator className="flex-1 opacity-20" />
                  <span className="font-mono text-xs text-white/30 tracking-widest flex-shrink-0">{group.products.length}</span>
                </div>
                {/* Horizontal scroll on mobile, grid on desktop */}
                <div className="relative">
                  <div className="flex gap-4 overflow-x-auto lg:grid lg:grid-cols-3 lg:overflow-visible pb-2 lg:pb-0 snap-x snap-mandatory lg:snap-none scrollbar-none">
                    {group.products.map(p => (
                      <div key={p.id} className="snap-start min-w-[280px] sm:min-w-[320px] lg:min-w-0 flex-shrink-0 lg:flex-shrink">
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                  {/* Fade edge on mobile to hint scroll */}
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none lg:hidden" />
                </div>
              </section>
            ))}
          </div>
        )}

        {products.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-display text-3xl italic text-white/25">No keyboards match your filters.</p>
            <button onClick={() => useProductStore.getState().clearFilters()}
              className="mt-5 font-mono text-sm tracking-widest uppercase text-white/35 hover:text-white transition-colors underline underline-offset-4">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
