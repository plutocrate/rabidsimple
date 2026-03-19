import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { productsService } from '@/lib/firestore'
import { MOCK_PRODUCTS } from '@/lib/mockData'
import { Search, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { Product } from '@/types'

export function DashboardProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    productsService.getAll()
      .then(p => setProducts(p.length ? p : MOCK_PRODUCTS))
      .catch(() => setProducts(MOCK_PRODUCTS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.includes(search.toLowerCase()) ||
    p.slug.includes(search.toLowerCase())
  )

  async function handleDelete(product: Product, e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm(`Delete "${product.name}"? Cannot be undone.`)) return
    try {
      await productsService.delete(product.id)
      setProducts(prev => prev.filter(p => p.id !== product.id))
    } catch (err: any) { alert(err?.message ?? 'Delete failed') }
  }

  return (
    <DashboardLayout>
      <div className="p-5 sm:p-7 lg:p-10">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <p className="font-mono text-sm tracking-widest uppercase text-white/30 mb-2">Catalogue</p>
            <h1 className="font-heading text-5xl text-white">Products</h1>
          </div>
          <Link to="/dashboard/products/new">
            <Button className="gap-2 h-11 text-sm font-bold"><Plus className="w-4 h-4" />New Product</Button>
          </Link>
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="pl-11 h-12 text-base" />
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3">
          {loading ? <p className="font-mono text-sm text-white/25 animate-pulse py-6">Loading…</p>
          : filtered.length === 0 ? <p className="font-sans text-xl text-white/28 py-10 text-center">No products found.</p>
          : filtered.map(p => (
            <Link key={p.id} to={`/dashboard/products/${p.id}`}
              className="block border border-white/10 p-5 hover:border-white/25 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-base font-semibold text-white truncate">{p.name}</p>
                  <p className="font-mono text-sm text-white/38 mt-0.5">{p.slug}</p>
                  <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                    <span className="font-mono text-xs tracking-widest uppercase text-white/45 border border-white/12 px-2.5 py-1 capitalize">{p.category}</span>
                    <span className="price-display text-base text-white/72 font-semibold">{formatPrice(p.basePrice)}</span>
                    <span className={`font-mono text-xs tracking-widest uppercase border px-2.5 py-1 ${p.inStock ? 'border-white/22 text-white/55' : 'border-red-500/35 text-red-400/70'}`}>
                      {p.inStock ? 'In Stock' : 'Out'}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-white/28 mt-2">{p.variants?.length ?? 0} variants · {p.tags?.length ?? 0} tags</p>
                </div>
                <Pencil className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block border border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['Product', 'Category', 'Price', 'Variants', 'Stock', ''].map(h => (
                  <th key={h} className="px-5 py-4 font-mono text-xs tracking-widest uppercase text-white/28 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-14 text-center font-mono text-sm text-white/25 animate-pulse">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-14 text-center font-sans text-xl text-white/25">No products found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.025] transition-colors group">
                  <td className="px-5 py-4">
                    <p className="font-sans text-base font-semibold text-white">{p.name}</p>
                    <p className="font-mono text-sm text-white/35 mt-0.5">{p.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm tracking-widest uppercase text-white/45 border border-white/12 px-2.5 py-1 capitalize">{p.category}</span>
                  </td>
                  <td className="px-5 py-4 price-display text-base text-white/72 font-semibold">{formatPrice(p.basePrice)}</td>
                  <td className="px-5 py-4 font-mono text-sm text-white/42">{p.variants?.length ?? 0} groups</td>
                  <td className="px-5 py-4">
                    <span className={`font-mono text-xs tracking-widest uppercase border px-2.5 py-1 ${p.inStock ? 'border-white/22 text-white/55' : 'border-red-500/35 text-red-400/70'}`}>
                      {p.inStock ? 'In Stock' : 'Sold Out'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                      <Link to={`/dashboard/products/${p.id}`} className="text-white/35 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></Link>
                      <Link to={`/product/${p.slug}`} target="_blank" className="text-white/25 hover:text-white/65 transition-colors"><ExternalLink className="w-4 h-4" /></Link>
                      <button onClick={e => handleDelete(p, e)} className="text-white/18 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && (
          <p className="font-mono text-sm text-white/25 mt-4 tracking-wide">{filtered.length} of {products.length} products</p>
        )}
      </div>
    </DashboardLayout>
  )
}
