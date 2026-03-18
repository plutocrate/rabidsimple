import { useState } from 'react'
import { useProductStore } from '@/store/useProductStore'
import { ALL_TAGS } from '@/lib/mockData'
import { cn } from '@/lib/utils'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'

export function FilterBar() {
  const { activeFilters, toggleFilter, clearFilters } = useProductStore()
  const [open, setOpen] = useState(false)

  const grouped = ALL_TAGS.reduce<Record<string, typeof ALL_TAGS>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = []
    acc[tag.category].push(tag)
    return acc
  }, {})

  const categoryLabels: Record<string, string> = {
    size: 'Size', layout: 'Layout', connectivity: 'Connectivity', switch: 'Switch', custom: 'Features',
  }

  return (
    <div className="border-b border-white/10 pb-0 mb-2">
      <div className="flex items-center gap-5 py-4 flex-wrap">
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2.5 font-mono text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors font-semibold">
          <SlidersHorizontal className="w-4 h-4" />
          Filter
          <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', open && 'rotate-180')} />
        </button>

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-white/25 text-lg">·</span>
            {activeFilters.map(f => {
              const tag = ALL_TAGS.find(t => t.value === f)
              return (
                <button key={f} onClick={() => toggleFilter(f)}
                  className="flex items-center gap-2 font-mono text-sm tracking-widest uppercase border border-white/40 bg-white/8 text-white/80 px-3 py-1.5 hover:border-white/60 transition-all">
                  {tag?.label ?? f} <X className="w-3 h-3" />
                </button>
              )
            })}
            <button onClick={clearFilters}
              className="font-mono text-sm tracking-widest uppercase text-white/35 hover:text-white transition-colors underline underline-offset-2">
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className={cn('overflow-hidden transition-all duration-300', open ? 'max-h-[600px] pb-6 opacity-100' : 'max-h-0 opacity-0')}>
        <div className="flex flex-wrap gap-8 pt-3">
          {Object.entries(grouped).map(([category, tags]) => (
            <div key={category}>
              <p className="font-mono text-xs tracking-widest uppercase text-white/35 mb-3 font-semibold">
                {categoryLabels[category] ?? category}
              </p>
              <div className="flex gap-2 flex-wrap">
                {tags.map(tag => {
                  const active = activeFilters.includes(tag.value)
                  return (
                    <button key={tag.value} onClick={() => toggleFilter(tag.value)}
                      className={cn('font-mono text-sm tracking-widest uppercase px-3 py-2 border transition-all duration-150',
                        active ? 'border-white bg-white/10 text-white' : 'border-white/18 text-white/45 hover:border-white/40 hover:text-white/70'
                      )}>
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
