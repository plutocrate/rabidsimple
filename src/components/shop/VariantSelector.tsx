import { cn } from '@/lib/utils'
import type { ProductVariant } from '@/types'
import { formatPrice } from '@/lib/utils'

interface VariantSelectorProps {
  variant: ProductVariant
  selected: string
  onSelect: (id: string) => void
}

export function VariantSelector({ variant, selected, onSelect }: VariantSelectorProps) {
  if (variant.type === 'color') {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-sm tracking-widest uppercase text-white/50">{variant.name}</span>
          <span className="font-mono text-sm text-white/40">{variant.options.find(o => o.id === selected)?.label ?? '—'}</span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {variant.options.map(opt => (
            <button key={opt.id} onClick={() => opt.available && onSelect(opt.id)} disabled={!opt.available}
              title={opt.label}
              className={cn('w-10 h-10 rounded-full border-2 transition-all duration-200 relative shrink-0',
                selected === opt.id ? 'border-white scale-110' : 'border-white/25 hover:border-white/60',
                !opt.available && 'opacity-25 cursor-not-allowed')}
              style={{ background: opt.hexColor ?? '#888' }}>
              {!opt.available && <span className="absolute inset-0 flex items-center justify-center"><span className="w-0.5 h-8 bg-white/50 rotate-45 absolute" /></span>}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-sm tracking-widest uppercase text-white/50">
          {variant.name}{variant.required && <span className="text-white/30 ml-1">*</span>}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {variant.options.map(opt => (
          <button key={opt.id} onClick={() => opt.available && onSelect(opt.id)} disabled={!opt.available}
            className={cn('flex items-center justify-between px-4 py-3.5 border transition-all text-left w-full',
              selected === opt.id ? 'border-white/50 bg-white/8 text-white' : 'border-white/12 text-white/55 hover:border-white/30 hover:text-white/80',
              !opt.available && 'opacity-25 cursor-not-allowed line-through')}>
            <span className="font-mono text-sm tracking-wide">{opt.label}</span>
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
