import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { ProductCard } from '@/components/shop/ProductCard'
import { useProductStore } from '@/store/useProductStore'

export function AccessoriesPage() {
  const { fetchProducts, products } = useProductStore()

  useEffect(() => { fetchProducts('accessory') }, [fetchProducts])

  const accessories = products.filter((p) => p.category === 'accessory')

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-12">
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mb-3">Components</p>
          <h1 className="font-display text-clamp-title italic text-white leading-none mb-4">Accessories</h1>
          <p className="font-mono text-xs text-white/35 max-w-lg leading-relaxed">
            MCUs, hotswap sockets, soldering tools, wires — everything to complete your build.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/5">
          {accessories.map((p) => (
            <div key={p.id} className="bg-background">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        {accessories.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-display text-2xl italic text-white/25">No accessories available yet.</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
