import { Link } from 'react-router-dom'
import { formatPrice, cn } from '@/lib/utils'
import type { Product } from '@/types'
import { ShoppingBag } from 'lucide-react'

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  return (
    <Link to={`/product/${product.slug}`}
      className={cn(
        'group block border border-white/12 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300',
        !product.inStock && 'opacity-55',
        className
      )}>
      {/* Image — fixed height */}
      <div className="relative h-56 bg-[#0e0e0e] overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
            <ShoppingBag className="w-12 h-12 text-white/15" />
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/65">
            <span className="font-mono text-sm tracking-widest uppercase text-white/70 border border-white/30 px-4 py-1.5">Sold Out</span>
          </div>
        )}
        {product.featured && product.inStock && (
          <div className="absolute top-3 left-3">
            <span className="font-mono text-xs tracking-widest uppercase bg-white text-black px-3 py-1 font-bold">Featured</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display text-2xl text-white leading-tight">{product.name}</h3>
          <span className="price-display text-lg text-white font-semibold flex-shrink-0 mt-0.5">
            {formatPrice(product.basePrice)}
          </span>
        </div>
        <p className="font-mono text-sm text-white/45 mb-4 leading-relaxed">{product.subtitle}</p>
        <div className="flex flex-wrap gap-2">
          {product.tags?.slice(0, 3).map(tag => (
            <span key={tag.id} className="font-mono text-xs tracking-widest uppercase border border-white/20 text-white/55 px-2.5 py-1">
              {tag.label}
            </span>
          ))}
          {(product.tags?.length ?? 0) > 3 && (
            <span className="font-mono text-xs tracking-widest uppercase border border-white/15 text-white/35 px-2.5 py-1">
              +{product.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
