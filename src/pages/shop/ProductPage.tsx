import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Check, ChevronLeft, ChevronRight, Box, Image } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { ModelViewer } from '@/components/3d/ModelViewer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useProductStore } from '@/store/useProductStore'
import { useCartStore } from '@/store/useCartStore'
import { formatPrice, cn } from '@/lib/utils'
import { productsService } from '@/lib/firestore'
import type { Product, ProductVariant } from '@/types'

// ─── Variant Picker ───────────────────────────────────────────────────────────

function VariantPicker({ variant, selected, onSelect }: {
  variant: ProductVariant; selected: string; onSelect: (id: string) => void
}) {
  if (variant.type === 'color') {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-sm tracking-widest uppercase text-white/55 font-semibold">{variant.name}</span>
          <span className="font-mono text-sm text-white/45">{variant.options.find(o => o.id === selected)?.label ?? '—'}</span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {variant.options.map(opt => (
            <button key={opt.id} onClick={() => opt.available && onSelect(opt.id)} disabled={!opt.available}
              title={opt.label}
              className={cn('w-10 h-10 rounded-full border-2 transition-all duration-200 relative flex-shrink-0',
                selected === opt.id ? 'border-white scale-110 ring-2 ring-white/30' : 'border-white/25 hover:border-white/60',
                !opt.available && 'opacity-30 cursor-not-allowed')}
              style={{ background: opt.hexColor ?? '#888' }}>
              {!opt.available && <span className="absolute inset-0 flex items-center justify-center"><span className="w-0.5 h-8 bg-white/50 rotate-45 absolute" /></span>}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-sm tracking-widest uppercase text-white/55 font-semibold">
          {variant.name}{variant.required && <span className="text-white/30 ml-1">*</span>}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {variant.options.map(opt => (
          <button key={opt.id} onClick={() => opt.available && onSelect(opt.id)} disabled={!opt.available}
            className={cn('flex items-center justify-between px-4 py-3 border transition-all text-left w-full',
              selected === opt.id ? 'border-white bg-white/8 text-white' : 'border-white/15 text-white/55 hover:border-white/35 hover:text-white/80',
              !opt.available && 'opacity-30 cursor-not-allowed line-through'
            )}>
            <span className="font-mono text-sm">{opt.label}</span>
            {opt.priceModifier !== 0 && (
              <span className="font-mono text-sm text-white/40 shrink-0 ml-4">
                {opt.priceModifier > 0 ? '+' : ''}{formatPrice(opt.priceModifier)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Image Slideshow ──────────────────────────────────────────────────────────

function ImageSlideshow({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const THRESHOLD = 50

  function prev() { setIdx(i => (i - 1 + images.length) % images.length) }
  function next() { setIdx(i => (i + 1) % images.length) }

  function onDragStart(clientX: number) {
    setDragging(true)
    setDragStart(clientX)
    setDragOffset(0)
  }
  function onDragMove(clientX: number) {
    if (!dragging) return
    setDragOffset(clientX - dragStart)
  }
  function onDragEnd() {
    if (!dragging) return
    setDragging(false)
    if (dragOffset < -THRESHOLD && images.length > 1) next()
    else if (dragOffset > THRESHOLD && images.length > 1) prev()
    setDragOffset(0)
  }

  if (images.length === 0) return (
    <div className="w-full h-full flex items-center justify-center bg-card">
      <p className="font-mono text-xs tracking-widest uppercase text-foreground/20">No images</p>
    </div>
  )

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={e => onDragStart(e.clientX)}
      onMouseMove={e => onDragMove(e.clientX)}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      onTouchStart={e => onDragStart(e.touches[0].clientX)}
      onTouchMove={e => { e.preventDefault(); onDragMove(e.touches[0].clientX) }}
      onTouchEnd={onDragEnd}
      style={{ touchAction: 'pan-y' }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.img
          key={idx}
          src={images[idx]}
          alt={`Product image ${idx + 1}`}
          initial={{ x: dragOffset < 0 ? 80 : -80, opacity: 0 }}
          animate={{ x: dragging ? dragOffset * 0.3 : 0, opacity: dragging ? 0.85 : 1 }}
          exit={{ x: dragOffset < 0 ? -80 : 80, opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIdx(i) }}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all duration-300',
                i === idx ? 'bg-foreground w-4' : 'bg-foreground/25 hover:bg-foreground/50'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ViewMode = '3d' | 'images'

export function ProductPage() {
  const { slug }      = useParams<{ slug: string }>()
  const { getBySlug } = useProductStore()
  const { addItem }   = useCartStore()

  const [fetched, setFetched]       = useState<Product | null>(null)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [added, setAdded]           = useState(false)
  const [viewMode, setViewMode]     = useState<ViewMode>('images')
  const ctaRef                      = useRef<HTMLDivElement>(null)
  const [stickyVisible, setStickyVisible] = useState(false)

  useEffect(() => {
    if (!slug) return
    productsService.getBySlug(slug).then(p => { if (p) setFetched(p) }).catch(() => {})
  }, [slug])

  const product = fetched ?? getBySlug(slug ?? '')

  useEffect(() => {
    if (!product) return
    const d: Record<string, string> = {}
    product.variants?.forEach(v => { const f = v.options.find(o => o.available); if (f) d[v.id] = f.id })
    setSelections(d)
  }, [product])

  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -80px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [product])

  const price = useMemo(() => {
    if (!product) return 0
    let p = product.basePrice
    product.variants?.forEach(v => { const o = v.options.find(o => o.id === selections[v.id]); if (o) p += o.priceModifier })
    return Math.max(p, 0)
  }, [product, selections])

  const partColors = useMemo(() => {
    const colors: Record<string, string> = {}
    if (!product) return colors
    product.variants?.forEach(v => {
      if (v.type !== 'color') return
      const opt = v.options.find(o => o.id === selections[v.id])
      if (!opt?.hexColor) return
      const name = v.name.toLowerCase()
      if (name.includes('keycap')) {
        colors['keycaps_left']  = opt.hexColor
        colors['keycaps_right'] = opt.hexColor
      } else {
        colors['case_left']  = opt.hexColor
        colors['case_right'] = opt.hexColor
      }
    })
    return colors
  }, [product, selections])

  function handleAdd() {
    if (!product) return
    addItem(product, selections, price)
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }

  // ── All hooks above this line ──────────────────────────────────────────────

  if (!product) return (
    <PageLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-mono text-lg text-white/30">Product not found.</p>
      </div>
    </PageLayout>
  )

  const has3D       = !!product?.modelPath
  const hasImages   = (product.images?.length ?? 0) > 0
  const hasVariants = (product.variants?.length ?? 0) > 0
  const showToggle  = has3D && hasImages
  const hasViewer   = has3D || hasImages

  return (
    <PageLayout>
      <div className="bg-black pb-24 lg:pb-0">

        {/* ── Mobile layout: sticky viewer top, scrollable info, sticky CTA bottom ── */}
        <div className="lg:hidden">

          {/* Sticky viewer — top */}
          {hasViewer && (
            <div className="sticky top-[72px] z-30 bg-[#0a0a0a]" style={{ height: '62vw', minHeight: 260, maxHeight: 420 }}>
              {showToggle && (
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  <button onClick={() => setViewMode('3d')}
                    className={cn('flex items-center gap-1 px-2 py-1 border font-mono text-[9px] tracking-widest uppercase transition-all',
                      viewMode === '3d' ? 'border-white/50 bg-white/10 text-white' : 'border-white/15 text-white/35')}>
                    <Box className="w-2.5 h-2.5" /> 3D
                  </button>
                  <button onClick={() => setViewMode('images')}
                    className={cn('flex items-center gap-1 px-2 py-1 border font-mono text-[9px] tracking-widest uppercase transition-all',
                      viewMode === 'images' ? 'border-white/50 bg-white/10 text-white' : 'border-white/15 text-white/35')}>
                    <Image className="w-2.5 h-2.5" /> Photos
                  </button>
                </div>
              )}
              {viewMode === 'images' && hasImages
                ? <ImageSlideshow images={product.images} />
                : has3D && product?.modelPath
                  ? <ModelViewer modelPath={product.modelPath} className="w-full h-full" />
                  : <ImageSlideshow images={product.images} />
              }
            </div>
          )}

          {/* Scrollable product info */}
          <div className="px-5 pt-6 pb-4">
            <p className="font-mono text-xs tracking-widest uppercase text-white/35 mb-1 capitalize">{product.category}</p>
            <h1 className="font-display text-3xl italic text-white mb-2">{product.name}</h1>
            <p className="font-sans text-sm text-white/65 leading-relaxed mb-4">{product.subtitle}</p>

            {(product.tags?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {product.tags.map(t => (
                  <span key={t.id} className="font-mono text-[10px] tracking-widest uppercase border border-white/20 text-white/50 px-2.5 py-1">{t.label}</span>
                ))}
              </div>
            )}

            {hasVariants && (
              <>
                <Separator className="mb-5 opacity-15" />
                {product.variants.map(v => (
                  <VariantPicker key={v.id} variant={v} selected={selections[v.id]}
                    onSelect={id => setSelections(s => ({ ...s, [v.id]: id }))} />
                ))}
              </>
            )}

            <Separator className="my-5 opacity-15" />
            <Tabs defaultValue="description">
              <TabsList className="mb-4">
                <TabsTrigger value="description" className="text-xs">Description</TabsTrigger>
                <TabsTrigger value="specs" className="text-xs">Specs</TabsTrigger>
              </TabsList>
              <TabsContent value="description">
                <div className="font-sans text-white/70 text-sm leading-relaxed whitespace-pre-line">
                  {product.longDescription || product.description}
                </div>
              </TabsContent>
              <TabsContent value="specs">
                <dl className="space-y-3">
                  {Object.entries(product.specs ?? {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-white/8 pb-3 gap-4">
                      <dt className="font-mono text-xs tracking-widest uppercase text-white/35 shrink-0">{k}</dt>
                      <dd className="font-mono text-xs text-white/65 text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky CTA — bottom, always visible */}
          <div ref={ctaRef} className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-white/10 px-5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] tracking-widest uppercase text-white/30">Total</p>
                <span className="price-display text-xl text-white font-bold">{formatPrice(price)}</span>
              </div>
              <Button onClick={handleAdd} disabled={added || !product.inStock}
                className={cn('h-12 px-8 text-sm font-bold gap-2 flex-1 max-w-[200px]', added && 'bg-white/15')}>
                {added ? <><Check className="w-4 h-4" />Added!</> : <><ShoppingBag className="w-4 h-4" />Add to Cart</>}
              </Button>
            </div>
            {!product.inStock && <p className="font-mono text-xs text-red-400/70 tracking-widest uppercase mt-1">Out of Stock</p>}
          </div>
        </div>

        {/* ── Desktop layout: two-column grid ── */}
        <div className={cn(
          "hidden lg:block max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-16 overflow-x-hidden",
          hasViewer ? "lg:grid lg:grid-cols-2 lg:gap-14 lg:items-start" : ""
        )}>

          {/* LEFT — product info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col pt-4 lg:pt-8 pb-8 lg:pb-16 min-w-0 order-2 lg:order-1"
          >
            <p className="font-mono text-sm tracking-widest uppercase text-white/35 mb-2 capitalize">{product.category}</p>
            <h1 className="font-display text-4xl lg:text-5xl italic text-white mb-3">{product.name}</h1>
            <p className={cn("font-sans text-base text-white/65 leading-relaxed", hasVariants ? "mb-6" : "mb-4")}>{product.subtitle}</p>

            {(product.tags?.length ?? 0) > 0 && (
              <div className={cn("flex flex-wrap gap-2", hasVariants ? "mb-8" : "mb-4")}>
                {product.tags.map(t => (
                  <span key={t.id} className="font-mono text-xs tracking-widest uppercase border border-white/20 text-white/50 px-3 py-1">{t.label}</span>
                ))}
              </div>
            )}

            {hasVariants && (
              <>
                <Separator className="mb-8 opacity-15" />
                <div>
                  {product.variants.map(v => (
                    <VariantPicker key={v.id} variant={v} selected={selections[v.id]}
                      onSelect={id => setSelections(s => ({ ...s, [v.id]: id }))} />
                  ))}
                </div>
              </>
            )}

            {!hasViewer && (
              <>
                <Separator className="my-8 opacity-15" />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/30 mb-1">Total price</p>
                    <span className="price-display text-3xl text-white font-bold">{formatPrice(price)}</span>
                  </div>
                  <Button size="lg" onClick={handleAdd} disabled={added || !product.inStock}
                    className={cn('h-14 px-8 text-base font-bold gap-3 shrink-0', added && 'bg-white/15')}>
                    {added ? <><Check className="w-5 h-5" />Added!</> : <><ShoppingBag className="w-5 h-5" />Add to Cart</>}
                  </Button>
                </div>
                {!product.inStock && <p className="font-mono text-sm text-red-400/70 tracking-widest uppercase mt-2">Out of Stock</p>}
              </>
            )}

            <Separator className="mt-8 mb-8 opacity-15" />
            <Tabs defaultValue="description">
              <TabsList className="mb-6">
                <TabsTrigger value="description" className="text-sm">Description</TabsTrigger>
                <TabsTrigger value="specs" className="text-sm">Specs</TabsTrigger>
              </TabsList>
              <TabsContent value="description">
                <div className="font-sans text-white/70 text-base lg:text-lg leading-relaxed whitespace-pre-line">
                  {product.longDescription || product.description}
                </div>
              </TabsContent>
              <TabsContent value="specs">
                <dl className="space-y-4">
                  {Object.entries(product.specs ?? {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-white/8 pb-4 gap-4">
                      <dt className="font-mono text-sm tracking-widest uppercase text-white/35 shrink-0">{k}</dt>
                      <dd className="font-mono text-sm text-white/65 text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* RIGHT — viewer + price + CTA */}
          {hasViewer && (
            <div className="lg:sticky lg:top-24 flex flex-col gap-5 pb-4 lg:pb-12 order-1 lg:order-2">
              {showToggle && (
                <div className="flex gap-1 self-end">
                  <button onClick={() => setViewMode('3d')}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 border font-mono text-[10px] tracking-widest uppercase transition-all',
                      viewMode === '3d' ? 'border-white/50 bg-white/8 text-white' : 'border-white/15 text-white/35 hover:border-white/30 hover:text-white/60')}>
                    <Box className="w-3 h-3" /> 3D
                  </button>
                  <button onClick={() => setViewMode('images')}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 border font-mono text-[10px] tracking-widest uppercase transition-all',
                      viewMode === 'images' ? 'border-white/50 bg-white/8 text-white' : 'border-white/15 text-white/35 hover:border-white/30 hover:text-white/60')}>
                    <Image className="w-3 h-3" /> Photos
                  </button>
                </div>
              )}
              <div className="w-full overflow-hidden bg-[#0a0a0a] rounded-sm"
                style={{ height: 'clamp(260px, 42vw, 520px)' }}>
                {viewMode === 'images' && hasImages
                  ? <ImageSlideshow images={product.images} />
                  : has3D && product?.modelPath
                    ? <ModelViewer modelPath={product.modelPath} className="w-full h-full" />
                    : <ImageSlideshow images={product.images} />
                }
              </div>
              <div ref={ctaRef} className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 px-1">
                <div className="flex-shrink-0">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-white/30 mb-1">Total price</p>
                  <span className="price-display text-2xl lg:text-3xl text-white font-bold">{formatPrice(price)}</span>
                </div>
                <Button size="lg" onClick={handleAdd} disabled={added || !product.inStock}
                  className={cn('w-full xs:w-auto h-12 lg:h-14 px-6 lg:px-8 text-sm lg:text-base font-bold gap-2 lg:gap-3', added && 'bg-white/15')}>
                  {added ? <><Check className="w-4 h-4 lg:w-5 lg:h-5" />Added!</> : <><ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5" />Add to Cart</>}
                </Button>
              </div>
              {!product.inStock && <p className="font-mono text-sm text-red-400/70 tracking-widest uppercase -mt-1 px-1">Out of Stock</p>}
            </div>
          )}
        </div>

      </div>
    </PageLayout>
  )
}
