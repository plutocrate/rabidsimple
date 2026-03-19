/**
 * ShopPage — single unified shop with 3 tabs: Full Builds, Barebones, Accessories.
 * No separate pages. Filter bar handles further filtering.
 */
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { ProductCard } from '@/components/shop/ProductCard'
import { FilterBar } from '@/components/shop/FilterBar'
import { useProductStore } from '@/store/useProductStore'
import { LandingViewer } from '@/components/3d/LandingViewer'
import { useSiteSettings } from '@/store/useSiteSettings'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils'

type Tab = 'full-build' | 'barebone' | 'accessory'

const TABS: { key: Tab; label: string; desc: string }[] = [
  { key: 'full-build',  label: 'Full Builds',  desc: 'Handwired, flashed, ready to type.' },
  { key: 'barebone',    label: 'Barebones',    desc: 'Case + PCB. Switches and keycaps sold separately.' },
  { key: 'accessory',   label: 'Accessories',  desc: 'MCUs, switches, sockets, and build tools.' },
]

export function ShopPage() {
  const [activeTab, setActiveTab] = useState<Tab>('full-build')
  const { fetchProducts, filteredProducts, activeFilters, clearFilters } = useProductStore()
  const { settings, fetch: fetchSettings } = useSiteSettings()
  const { isAdmin, isLoading: authLoading } = useAuthStore()

  useEffect(() => { fetchSettings() }, [])

  useEffect(() => {
    clearFilters()
    // Fetch all products; we filter client-side by tab
    fetchProducts()
  }, []) // eslint-disable-line

  const allProducts = filteredProducts()

  // Map tab to category: full-build = 'keyboard', barebone = 'barebone', accessory = 'accessory'
  const tabCategory = { 'full-build': 'keyboard', 'barebone': 'barebone', 'accessory': 'accessory' } as Record<Tab, string>
  const products = allProducts.filter(p => p.category === tabCategory[activeTab])

  if (settings.shopClosed && !isAdmin && !authLoading) {
    return (
      <PageLayout hideFooter>
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#060606]">
          {/* Live 3D keyboard — same as hero */}
          <div className="absolute inset-0">
            <LandingViewer modelPath={settings.heroModelPath || '/heroMedia/corne_hero.json'} />
          </div>
          {/* Dark overlay so text is readable */}
          <div className="absolute inset-0 bg-black/55 z-10" />
          {/* Message */}
          <div className="relative z-20 text-center px-6 max-w-lg">
            <p className="font-mono text-xs tracking-widest uppercase text-white/40 mb-6">RABID</p>
            <h1 className="font-heading text-[clamp(3rem,10vw,6rem)] leading-none text-white mb-6">
              {settings.shopClosedMessage || 'Shop will open soon.'}
            </h1>
            <p className="font-display text-lg italic text-white/50">
              We're preparing something worth waiting for.
            </p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-28 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <p className="font-mono text-sm tracking-widest uppercase text-white/40 mb-3">Catalogue</p>
          <h1 className="font-heading text-[clamp(3.5rem,8vw,6rem)] leading-none text-white mb-4">Shop</h1>
          <p className="font-sans text-base text-white/65 max-w-xl leading-relaxed">
            Every keyboard is handwired and built to order in India. No RGB. No shortcuts.
          </p>
        </motion.div>

        {/* Tab bar */}
        <div className="flex gap-0 mb-8 border-b border-white/10 pb-0 overflow-x-auto scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn('px-4 sm:px-5 py-4 font-mono text-xs sm:text-sm tracking-widest uppercase transition-all border-b-2 -mb-px whitespace-nowrap flex-shrink-0',
                activeTab === tab.key
                  ? 'text-white border-white'
                  : 'text-white/40 border-transparent hover:text-white/70 hover:border-white/30'
              )}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab description + filter */}
        <div className="mb-6">
          <p className="font-sans text-base text-white/60 mb-5">
            {TABS.find(t => t.key === activeTab)?.desc}
          </p>
          {activeTab !== 'accessory' && <FilterBar />}
        </div>

        {/* Count */}
        <p className="font-mono text-sm text-white/35 mb-6 tracking-wide">
          {products.length} {products.length === 1 ? 'product' : 'products'}
          {activeFilters.length > 0 && ` · ${activeFilters.length} filter${activeFilters.length > 1 ? 's' : ''} active`}
        </p>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl italic text-white/25">Nothing here yet.</p>
            {activeFilters.length > 0 && (
              <button onClick={clearFilters} className="mt-5 font-mono text-base tracking-widest uppercase text-white/40 hover:text-white transition-colors underline underline-offset-4">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </motion.div>
        )}
      </div>
    </PageLayout>
  )
}
