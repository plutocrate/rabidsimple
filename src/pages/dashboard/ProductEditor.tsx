/**
 * ProductEditor — full CRUD for a single product.
 * Covers: basic info, images, tags, variants (with options), specs, Cosmos model, flags.
 * Route: /dashboard/products/new  and  /dashboard/products/:id
 */

import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { productsService, uploadProductImage } from '@/lib/firestore'
import { formatPrice, cn } from '@/lib/utils'
import {
  ArrowLeft, Save, Trash2, Plus, X, GripVertical,
  ChevronDown, ChevronUp, Check, AlertCircle, Image as ImageIcon
} from 'lucide-react'
import type { Product, ProductTag, ProductVariant } from '@/types'

// ─── helpers ─────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

const EMPTY: Omit<Product, 'id' | 'createdAt'> = {
  slug: '', name: '', subtitle: '', description: '', longDescription: '',
  category: 'keyboard', basePrice: 0, images: [], tags: [], variants: [],
  specs: {}, inStock: true, featured: false, stockCount: undefined,
}

const TAG_CATEGORIES = ['size', 'layout', 'connectivity', 'switch', 'custom'] as const
const VARIANT_TYPES  = ['color', 'switch', 'keycap', 'addon'] as const
const CATEGORIES     = ['keyboard', 'barebone', 'accessory'] as const

// ─── sub-components ───────────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
      >
        <span className="font-mono text-xs tracking-widest uppercase text-white/70">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="font-mono text-[11px] tracking-widest uppercase text-white/40 mb-1.5 block">{label}</Label>
      {hint && <p className="font-mono text-[10px] text-white/25 mb-2">{hint}</p>}
      {children}
    </div>
  )
}

// ─── Tags editor ──────────────────────────────────────────────────────────────
function TagsEditor({ tags, onChange }: { tags: ProductTag[]; onChange: (t: ProductTag[]) => void }) {
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const [category, setCategory] = useState<ProductTag['category']>('custom')

  function add() {
    if (!label.trim()) return
    const slug = value.trim() || label.toLowerCase().replace(/\s+/g, '-')
    onChange([...tags, { id: uid(), label: label.trim(), value: slug, category }])
    setLabel(''); setValue('')
  }

  return (
    <div className="space-y-3">
      {/* existing tags */}
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {tags.length === 0 && <p className="font-mono text-[11px] text-white/20">No tags yet</p>}
        {tags.map(t => (
          <div key={t.id} className="flex items-center gap-1.5 border border-white/15 px-2.5 py-1 bg-white/4">
            <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest">{t.label}</span>
            <span className="font-mono text-[9px] text-white/25">· {t.category}</span>
            <button onClick={() => onChange(tags.filter(x => x.id !== t.id))} className="text-white/25 hover:text-red-400 transition-colors ml-1">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      {/* add row */}
      <div className="flex gap-2 flex-wrap">
        <Input placeholder="Label (e.g. 76 Keys)" value={label} onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} className="flex-1 min-w-[140px]" />
        <Input placeholder="value (e.g. 76-keys)" value={value} onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} className="flex-1 min-w-[120px]" />
        <select value={category} onChange={e => setCategory(e.target.value as any)}
          className="bg-[#0a0a0a] border border-white/10 px-3 py-2 font-mono text-xs text-white/60 focus:outline-none">
          {TAG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button size="sm" onClick={add} variant="outline" className="gap-1"><Plus className="w-3 h-3" />Add</Button>
      </div>
    </div>
  )
}

// ─── Specs editor ─────────────────────────────────────────────────────────────
function SpecsEditor({ specs, onChange }: { specs: Record<string, string>; onChange: (s: Record<string, string>) => void }) {
  const [key, setKey]   = useState('')
  const [val, setVal]   = useState('')
  const entries = Object.entries(specs)

  function add() {
    if (!key.trim()) return
    onChange({ ...specs, [key.trim()]: val.trim() })
    setKey(''); setVal('')
  }

  function remove(k: string) {
    const next = { ...specs }; delete next[k]; onChange(next)
  }

  function updateVal(k: string, v: string) {
    onChange({ ...specs, [k]: v })
  }

  return (
    <div className="space-y-2">
      {entries.length === 0 && <p className="font-mono text-[11px] text-white/20">No specs yet</p>}
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-2">
          <span className="font-mono text-xs text-white/50 tracking-widest uppercase w-36 shrink-0">{k}</span>
          <Input value={v} onChange={e => updateVal(k, e.target.value)} className="flex-1" />
          <button onClick={() => remove(k)} className="text-white/25 hover:text-red-400 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <Input placeholder="Key (e.g. Layout)" value={key} onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} className="w-36 shrink-0" />
        <Input placeholder="Value (e.g. 76 keys, split)" value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} className="flex-1" />
        <Button size="sm" onClick={add} variant="outline" className="gap-1 shrink-0"><Plus className="w-3 h-3" />Add</Button>
      </div>
    </div>
  )
}

// ─── Single variant option row ────────────────────────────────────────────────
function OptionRow({
  opt, variantType,
  onChange, onRemove,
}: {
  opt: ProductVariant['options'][number]
  variantType: ProductVariant['type']
  onChange: (patch: Partial<typeof opt>) => void
  onRemove: () => void
}) {
  return (
    <div className="flex gap-2 items-center flex-wrap border border-white/6 px-3 py-2.5 bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
      <GripVertical className="w-3.5 h-3.5 text-white/15 flex-shrink-0" />

      <Input placeholder="Label" value={opt.label} onChange={e => onChange({ label: e.target.value })}
        className="flex-1 min-w-[130px]" />

      <Input placeholder="value-slug" value={opt.value} onChange={e => onChange({ value: e.target.value })}
        className="w-32 flex-shrink-0" />

      <div className="flex items-center gap-1 shrink-0">
        <span className="font-mono text-[10px] text-white/30">₹</span>
        <Input type="number" placeholder="0" value={opt.priceModifier}
          onChange={e => onChange({ priceModifier: Number(e.target.value) })}
          className="w-24" />
      </div>

      {variantType === 'color' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <input type="color" value={opt.hexColor ?? '#888888'}
            onChange={e => onChange({ hexColor: e.target.value })}
            className="w-7 h-7 rounded-none border border-white/15 cursor-pointer bg-transparent" />
        </div>
      )}

      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
        <input type="checkbox" checked={opt.available} onChange={e => onChange({ available: e.target.checked })} className="accent-white" />
        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Avail</span>
      </label>

      <button onClick={onRemove} className="text-white/20 hover:text-red-400 transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Single variant block ─────────────────────────────────────────────────────
function VariantBlock({
  variant, onChange, onRemove,
}: {
  variant: ProductVariant
  onChange: (v: ProductVariant) => void
  onRemove: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  function addOption() {
    onChange({
      ...variant,
      options: [...variant.options, {
        id: uid(), label: '', value: '', priceModifier: 0, available: true,
        ...(variant.type === 'color' ? { hexColor: '#888888' } : {}),
      }],
    })
  }

  function updateOption(i: number, patch: Partial<ProductVariant['options'][number]>) {
    const opts = variant.options.map((o, idx) => idx === i ? { ...o, ...patch } : o)
    onChange({ ...variant, options: opts })
  }

  function removeOption(i: number) {
    onChange({ ...variant, options: variant.options.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="border border-white/12 overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03]">
        <GripVertical className="w-3.5 h-3.5 text-white/20 shrink-0" />
        <button onClick={() => setCollapsed(v => !v)} className="flex-1 flex items-center gap-3 text-left min-w-0">
          <span className="font-mono text-xs tracking-widest uppercase text-white/70 truncate">{variant.name || 'Untitled variant'}</span>
          <span className="font-mono text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 shrink-0">{variant.type}</span>
          <span className="font-mono text-[10px] text-white/25 shrink-0">{variant.options.length} options</span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={variant.required} onChange={e => onChange({ ...variant, required: e.target.checked })} className="accent-white" />
            <span className="font-mono text-[10px] text-white/35 uppercase tracking-widest">Required</span>
          </label>
          <button onClick={onRemove} className="text-white/20 hover:text-red-400 transition-colors p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setCollapsed(v => !v)} className="text-white/30 p-1">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-3 bg-black/20">
          {/* variant name & type */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <Label className="font-mono text-[10px] tracking-widest uppercase text-white/30 mb-1 block">Variant Name</Label>
              <Input value={variant.name} onChange={e => onChange({ ...variant, name: e.target.value })} placeholder="e.g. Switches" />
            </div>
            <div className="w-36 shrink-0">
              <Label className="font-mono text-[10px] tracking-widest uppercase text-white/30 mb-1 block">Type</Label>
              <select value={variant.type} onChange={e => onChange({ ...variant, type: e.target.value as any })}
                className="w-full bg-[#0a0a0a] border border-white/10 px-3 py-2 font-mono text-xs text-white/60 focus:outline-none h-10">
                {VARIANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* column headers */}
          <div className="flex gap-2 flex-wrap px-1">
            <span className="font-mono text-[9px] tracking-widest uppercase text-white/20 flex-1 min-w-[130px]">Label</span>
            <span className="font-mono text-[9px] tracking-widest uppercase text-white/20 w-32">Value slug</span>
            <span className="font-mono text-[9px] tracking-widest uppercase text-white/20 w-24">Price mod</span>
            {variant.type === 'color' && <span className="font-mono text-[9px] tracking-widest uppercase text-white/20 w-12">Color</span>}
          </div>

          {/* options */}
          {variant.options.map((opt, i) => (
            <OptionRow key={opt.id} opt={opt} variantType={variant.type}
              onChange={patch => updateOption(i, patch)}
              onRemove={() => removeOption(i)} />
          ))}

          <Button size="sm" variant="outline" onClick={addOption} className="gap-1.5 w-full mt-1">
            <Plus className="w-3 h-3" /> Add Option
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Images editor ────────────────────────────────────────────────────────────
function ImagesEditor({ images, slug, onChange }: { images: string[]; slug: string; onChange: (imgs: string[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput]   = useState('')

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !slug) return
    setUploading(true)
    try {
      const url = await uploadProductImage(file, slug)
      onChange([...images, url])
    } catch { alert('Upload failed — make sure Firebase Storage is configured.') }
    finally { setUploading(false); e.target.value = '' }
  }

  function addUrl() {
    const u = urlInput.trim()
    if (!u) return
    onChange([...images, u])
    setUrlInput('')
  }

  return (
    <div className="space-y-3">
      {/* preview grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative group aspect-[4/3] bg-[#0e0e0e] border border-white/8 overflow-hidden">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {i > 0 && (
                <button onClick={() => { const a = [...images]; [a[i-1],a[i]] = [a[i],a[i-1]]; onChange(a) }}
                  className="font-mono text-[9px] tracking-widest uppercase border border-white/30 text-white px-2 py-1 hover:bg-white/10">↑</button>
              )}
              <button onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                className="font-mono text-[9px] tracking-widest uppercase border border-red-500/40 text-red-400 px-2 py-1 hover:bg-red-900/20">Remove</button>
            </div>
            {i === 0 && (
              <span className="absolute top-2 left-2 font-mono text-[9px] tracking-widest uppercase bg-white text-black px-1.5 py-0.5">Primary</span>
            )}
          </div>
        ))}
        {images.length === 0 && (
          <div className="aspect-[4/3] border border-dashed border-white/10 flex items-center justify-center col-span-2 sm:col-span-3">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="font-mono text-[10px] text-white/20">No images yet</p>
            </div>
          </div>
        )}
      </div>

      {/* upload controls */}
      <div className="flex gap-2 items-center flex-wrap pt-1">
        <label className={cn('flex items-center gap-2 font-mono text-xs tracking-widest uppercase border border-white/15 text-white/50 px-3 py-2 cursor-pointer hover:border-white/30 hover:text-white transition-colors', uploading && 'opacity-40 pointer-events-none')}>
          <ImageIcon className="w-3.5 h-3.5" />
          {uploading ? 'Uploading…' : 'Upload Image'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
        <span className="font-mono text-[10px] text-white/20">or</span>
        <Input placeholder="Paste image URL" value={urlInput} onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addUrl()} className="flex-1 min-w-[200px]" />
        <Button size="sm" variant="outline" onClick={addUrl}>Add URL</Button>
      </div>
      {!slug && <p className="font-mono text-[10px] text-yellow-400/60">⚠ Set a slug first before uploading images</p>}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function ProductEditor() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew    = !id || id === 'new'

  const [product, setProduct] = useState<Omit<Product, 'id' | 'createdAt'>>(EMPTY)
  const [productId, setProductId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [error, setError]         = useState('')

  // load existing product
  useEffect(() => {
    if (isNew || !id) return
    setIsLoading(true)
    productsService.getById(id!).then(p => {
      if (p) { const { id: pid, createdAt, ...rest } = p; setProduct(rest); setProductId(pid) }
    }).catch(() => {}).finally(() => setIsLoading(false))
  }, [id, isNew])

  const patch = useCallback((p: Partial<typeof product>) => {
    setProduct(prev => ({ ...prev, ...p }))
  }, [])

  async function handleSave() {
    if (!product.name?.trim() || !product.slug?.trim()) { setError('Name and slug are required.'); return }
    setSaving(true); setError('')
    try {
        // Clean undefined/empty fields before sending to Firestore
      const safeProduct: any = {
        ...product,
        images:   product.images   ?? [],
        tags:     product.tags     ?? [],
        variants: product.variants ?? [],
        specs:    product.specs    ?? {},
      }
      // Remove empty/undefined optional fields
      if (!safeProduct.modelPath)        delete safeProduct.modelPath
      if (!safeProduct.subtitle)         delete safeProduct.subtitle
      if (!safeProduct.longDescription)  delete safeProduct.longDescription
      if (safeProduct.stockCount === undefined || safeProduct.stockCount === null) delete safeProduct.stockCount
      if (isNew) {
        // CREATE new product
        const created = await productsService.create(safeProduct)
        setProductId(created.id)
        setSaveStatus('saved')
        setTimeout(() => navigate(`/dashboard/products/${created.id}`), 800)
      } else {
        // UPDATE existing — productId is set by the load useEffect
        const docId = productId || id
        if (!docId || docId === 'new') {
          throw new Error('Cannot update: product ID is missing. Try deleting this and creating a new product.')
        }
        await productsService.update(docId, safeProduct)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2500)
      }
    } catch (e: any) {
      console.error('Save error:', e)
      setError(e?.message ?? String(e) ?? 'Save failed')
      setSaveStatus('error')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm(`Permanently delete "${product.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await productsService.delete(productId ?? id!)
      navigate('/dashboard/products')
    } catch (e: any) { alert(e?.message ?? 'Delete failed'); setDeleting(false) }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="font-mono text-sm text-white/20 animate-pulse">Loading product…</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/dashboard/products" className="text-white/30 hover:text-white transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <p className="font-mono text-[11px] tracking-widest uppercase text-white/25 mb-0.5">
                {isNew ? 'New Product' : 'Edit Product'}
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl text-white truncate">
                {product.name || 'Untitled'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isNew && (
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{deleting ? 'Deleting…' : 'Delete'}</span>
              </Button>
            )}
            {!isNew && product.slug && (
              <Link to={`/product/${product.slug}`} target="_blank">
                <Button variant="outline" size="sm">View Live ↗</Button>
              </Link>
            )}
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5 min-w-[100px]">
              {saveStatus === 'saved' ? <><Check className="w-3.5 h-3.5" /> Saved</> :
               saveStatus === 'error' ? <><AlertCircle className="w-3.5 h-3.5" /> Error</> :
               <><Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}</>}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 font-mono text-sm text-red-400/80 border border-red-500/20 bg-red-900/10 px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-4">

          {/* ── 1. BASIC INFO ── */}
          <Section title="Basic Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Product Name *">
                <Input value={product.name} onChange={e => patch({ name: e.target.value })} placeholder="Dactyl Manuball Pro" />
              </Field>
              <Field label="Slug *" hint="URL identifier, lowercase, hyphens only">
                <Input value={product.slug}
                  onChange={e => patch({ slug: (e.target.value ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  placeholder="dactyl-manuball-pro" />
              </Field>
            </div>

            <Field label="Subtitle" hint="Short line shown under the name on product/listing pages">
              <Input value={product.subtitle} onChange={e => patch({ subtitle: e.target.value })}
                placeholder="Sculpted split ergonomic with integrated trackball" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Category">
                <select value={product.category} onChange={e => patch({ category: e.target.value as any })}
                  className="w-full bg-[#0a0a0a] border border-white/10 px-3 py-2 font-mono text-sm text-white/70 focus:outline-none h-10">
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </Field>
              <Field label="Base Price (₹)" hint="Price before variant modifiers">
                <Input type="number" value={product.basePrice}
                  onChange={e => patch({ basePrice: Number(e.target.value) })} min={0} />
              </Field>
            </div>

            <div className="flex gap-6 flex-wrap pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={product.inStock} onChange={e => patch({ inStock: e.target.checked })} className="accent-white w-4 h-4" />
                <span className="font-mono text-xs tracking-widest uppercase text-white/50">In Stock</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={product.featured} onChange={e => patch({ featured: e.target.checked })} className="accent-white w-4 h-4" />
                <span className="font-mono text-xs tracking-widest uppercase text-white/50">Featured (homepage)</span>
              </label>
            </div>
            <Field label="Stock Count" hint="Leave empty for unlimited. Set to 1 for last unit — cart will prevent adding more.">
              <Input
                type="number"
                min={1}
                placeholder="Unlimited"
                value={(product as any).stockCount ?? ''}
                onChange={e => patch({ stockCount: e.target.value ? Number(e.target.value) : undefined } as any)}
              />
            </Field>
          </Section>

          {/* ── 2. DESCRIPTION ── */}
          <Section title="Description">
            <Field label="Short Description" hint="Shown in cards and meta descriptions">
              <textarea value={product.description} onChange={e => patch({ description: e.target.value })}
                rows={3} placeholder="A handwired sculpted split keyboard with integrated trackball."
                className="w-full bg-transparent border border-white/10 px-3 py-2.5 font-mono text-sm text-white/70 resize-y focus:outline-none focus:border-white/30 leading-relaxed" />
            </Field>
            <Field label="Long Description" hint="Full product story — shown in the Description tab on the product page. Markdown-style line breaks work.">
              <textarea value={product.longDescription} onChange={e => patch({ longDescription: e.target.value })}
                rows={10} placeholder="The full story of this keyboard..."
                className="w-full bg-transparent border border-white/10 px-3 py-2.5 font-mono text-sm text-white/70 resize-y focus:outline-none focus:border-white/30 leading-relaxed" />
            </Field>
          </Section>

          {/* ── 3. IMAGES ── */}
          <Section title="Images">
            <p className="font-mono text-[11px] text-white/30">First image is the primary/thumbnail. Uploads go to: <span className="text-white/50">productMedia/{product.slug || '<slug>'}/images/</span></p>
            <ImagesEditor images={product.images} slug={product.slug} onChange={imgs => patch({ images: imgs })} />
          </Section>

          {/* ── 4. 3D MODEL ── */}
          <Section title="3D Model">
            <Field label="Model Path" hint="Path to a JSON model in /public. Use the dropdown for known models or type a custom path.">
              <div className="space-y-2">
                <select
                  value={product.modelPath ?? ''}
                  onChange={e => patch({ modelPath: e.target.value || undefined })}
                  className="w-full bg-[#0a0a0a] border border-white/10 px-3 py-2 font-mono text-sm text-white/70 focus:outline-none h-10"
                >
                  <option value="">— No 3D model (shows placeholder) —</option>
                  <option value="/heroMedia/corne_hero.json">heroMedia / corne_hero.json</option>
                </select>
                <Input
                  value={product.modelPath ?? ''}
                  onChange={e => patch({ modelPath: e.target.value || undefined })}
                  placeholder={`/productMedia/${product.slug || 'your-slug'}/model.json`}
                />
                <p className="font-mono text-[10px] text-white/25">
                  Convert models: <span className="text-white/40">bash scripts/convert-model.sh</span> → save to <span className="text-white/40">public/productMedia/{'{slug}'}/model.json</span>
                </p>
              </div>
            </Field>
          </Section>

          {/* ── 5. TAGS ── */}
          <Section title="Tags & Filters">
            <p className="font-mono text-[11px] text-white/30">Tags appear as badges on product cards and power the filter bar on the keyboards page.</p>
            <TagsEditor tags={product.tags} onChange={tags => patch({ tags })} />
          </Section>

          {/* ── 6. VARIANTS ── */}
          <Section title="Variants & Options">
            <p className="font-mono text-[11px] text-white/30 mb-2">
              Each variant is a configurable choice (color, switch, MCU, etc). Price modifiers are added to the base price.
              Negative modifiers reduce the price (e.g. "No switches: −₹3,000").
            </p>

            {/* summary table */}
            {product.variants.length > 0 && (
              <div className="border border-white/8 mb-4 overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="border-b border-white/6">
                      {['Variant', 'Type', 'Options', 'Required', ''].map(h => (
                        <th key={h} className="px-4 py-2 font-mono text-[9px] tracking-widest uppercase text-white/20 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v, i) => (
                      <tr key={v.id} className="border-b border-white/4 hover:bg-white/[0.02]">
                        <td className="px-4 py-2 font-mono text-xs text-white/70">{v.name}</td>
                        <td className="px-4 py-2"><Badge>{v.type}</Badge></td>
                        <td className="px-4 py-2 font-mono text-xs text-white/40">{v.options.length} options</td>
                        <td className="px-4 py-2 font-mono text-xs text-white/40">{v.required ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2">
                          <button onClick={() => {
                            const el = document.getElementById(`variant-${v.id}`)
                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }} className="font-mono text-[10px] tracking-widest uppercase text-white/25 hover:text-white transition-colors underline">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* variant editors */}
            <div className="space-y-3">
              {product.variants.map((v, i) => (
                <div key={v.id} id={`variant-${v.id}`}>
                  <VariantBlock
                    variant={v}
                    onChange={updated => {
                      const arr = [...product.variants]
                      arr[i] = updated
                      patch({ variants: arr })
                    }}
                    onRemove={() => patch({ variants: product.variants.filter((_, idx) => idx !== i) })}
                  />
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="gap-1.5 mt-3 w-full sm:w-auto"
              onClick={() => patch({ variants: [...product.variants, {
                id: uid(), name: '', type: 'addon', required: false, options: []
              }]})}>
              <Plus className="w-3.5 h-3.5" /> Add Variant Group
            </Button>
          </Section>

          {/* ── 7. SPECS ── */}
          <Section title="Specs Table">
            <p className="font-mono text-[11px] text-white/30">Key-value pairs shown in the Specs tab on the product page. E.g. "Layout" → "76 keys, split".</p>
            <SpecsEditor specs={product.specs ?? {}} onChange={specs => patch({ specs })} />
          </Section>

        </div>

        {/* Bottom save bar */}
        <div className="sticky bottom-0 left-0 right-0 mt-8 pt-4 pb-6 border-t border-white/8 bg-[#050505]/95 backdrop-blur-sm flex items-center justify-between gap-4 flex-wrap">
          <div>
            {error && <p className="font-mono text-sm text-red-400/80">{error}</p>}
            {saveStatus === 'saved' && <p className="font-mono text-sm text-white/50 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Saved successfully</p>}
          </div>
          <div className="flex gap-3">
            {!isNew && product.slug && (
              <Link to={`/product/${product.slug}`} target="_blank">
                <Button variant="outline" size="sm">View Live ↗</Button>
              </Link>
            )}
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5 min-w-[120px]">
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : isNew ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
